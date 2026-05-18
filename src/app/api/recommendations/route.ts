import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/api-auth'
import { db } from '@/lib/db'

// ─── Recommendation cache (1 hour TTL per user) ───────────────────────────────
const recommendationCache = new Map<
  string,
  { data: RecommendationItem[]; timestamp: number }
>()
const CACHE_TTL_MS = 60 * 60 * 1000 // 1 hour

interface RecommendationItem {
  assetId: string
  assetName: string
  reason: string
  score: number
  matchType: string
}

const SYSTEM_PROMPT = `You are a financial advisor AI for 3GSP, a fractional real estate platform by GALAXY LLC. Analyze the user's portfolio and recommend the top 3 assets they should consider investing in. Consider diversification, risk profile, budget, and geographic preferences.

You MUST respond with valid JSON only — no markdown, no explanation outside the JSON. The JSON must be an array of exactly 3 objects with this shape:
[
  {
    "assetId": "the asset slug or id from the provided list",
    "assetName": "the asset name",
    "reason": "a 2-3 sentence explanation of why this asset is recommended for this user",
    "score": 85,
    "matchType": "diversification" | "yield" | "growth" | "budget_fit" | "geographic"
  }
]

Rules:
- Only recommend assets from the provided available assets list — use their slug as assetId
- Do NOT recommend assets the user already owns
- Prioritize assets that fill gaps in the user's current portfolio (different cities, types, risk levels)
- Consider the user's budget (balance + total invested) when recommending
- score must be 0-100 indicating how well the asset fits the user's profile
- matchType should reflect the PRIMARY reason for the recommendation
- reason should be specific to the user's situation, not generic`

export async function GET(request: Request) {
  const { error, session } = await requireAuth(request.headers.get('cookie'))
  if (error) return error

  const userId = session!.user!.id

  // Check cache
  const cached = recommendationCache.get(userId)
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return NextResponse.json({ recommendations: cached.data, cached: true })
  }

  try {
    // Fetch user data with current investments
    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        balance: true,
        totalInvested: true,
        totalEarnings: true,
        riskProfile: true,
        preferredLanguage: true,
        investments: {
          where: { status: { in: ['active', 'completed', 'pending'] } },
          include: {
            asset: {
              select: {
                id: true,
                name: true,
                slug: true,
                type: true,
                city: true,
                country: true,
                riskLevel: true,
                annualYield: true,
                pricePerFraction: true,
                totalValue: true,
              },
            },
          },
        },
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Fetch all available (published) assets
    const availableAssets = await db.asset.findMany({
      where: { status: 'published', availableFractions: { gt: 0 } },
      select: {
        id: true,
        name: true,
        slug: true,
        type: true,
        city: true,
        region: true,
        country: true,
        riskLevel: true,
        annualYield: true,
        pricePerFraction: true,
        minimumInvestment: true,
        totalValue: true,
        fundedPercentage: true,
        projectedAppreciation: true,
        totalProjectedReturn: true,
        totalFractions: true,
        availableFractions: true,
      },
      orderBy: { fundedPercentage: 'desc' },
    })

    // Filter out assets the user already has investments in
    const investedAssetIds = new Set(user.investments.map((inv) => inv.assetId))
    const candidateAssets = availableAssets.filter(
      (a) => !investedAssetIds.has(a.id)
    )

    if (candidateAssets.length === 0) {
      return NextResponse.json({
        recommendations: [],
        message: 'All available assets are already in your portfolio.',
      })
    }

    // Build user prompt with portfolio and available assets context
    const userInvestments = user.investments.map((inv) => ({
      name: inv.asset.name,
      type: inv.asset.type,
      city: inv.asset.city,
      country: inv.asset.country,
      amount: inv.totalAmount,
      yield: inv.asset.annualYield,
      riskLevel: inv.asset.riskLevel,
    }))

    const assetsList = candidateAssets.map((a) => ({
      id: a.slug,
      name: a.name,
      type: a.type,
      city: a.city,
      country: a.country,
      riskLevel: a.riskLevel,
      annualYield: a.annualYield,
      pricePerFraction: a.pricePerFraction,
      minimumInvestment: a.minimumInvestment,
      totalValue: a.totalValue,
      fundedPercentage: a.fundedPercentage,
      projectedAppreciation: a.projectedAppreciation,
      totalProjectedReturn: a.totalProjectedReturn,
      availableFractions: a.availableFractions,
    }))

    const userPrompt = `## User Profile
- Total Invested: $${user.totalInvested.toLocaleString('en-US')} USD
- Available Balance: $${user.balance.toLocaleString('en-US')} USD
- Budget: $${(user.balance + user.totalInvested).toLocaleString('en-US')} USD total portfolio value
- Risk Profile: ${user.riskProfile || 'not specified'}
- Preferred Language: ${user.preferredLanguage || 'es'}

## Current Investments (${userInvestments.length})
${userInvestments.length > 0
      ? userInvestments
          .map(
            (inv) =>
              `- ${inv.name} (${inv.type}) in ${inv.city}, ${inv.country} — invested $${inv.amount.toLocaleString('en-US')}, yield ${inv.yield}%, risk ${inv.riskLevel}`
          )
          .join('\n')
      : 'No investments yet. This is a new investor.'
    }

## Available Assets to Recommend From (${assetsList.length})
${assetsList
      .map(
        (a) =>
          `- ${a.name} [slug: ${a.id}] (${a.type}) — ${a.city}, ${a.country} — price $${a.pricePerFraction}/fraction, yield ${a.annualYield}%, risk ${a.riskLevel}, funded ${a.fundedPercentage}%, available ${a.availableFractions} fractions`
      )
      .join('\n')
    }

Based on this data, recommend the top 3 assets from the Available Assets list that this user should consider investing in. Return only valid JSON array.`

    // Use z-ai-web-dev-sdk LLM
    try {
      const ZAI = (await import('z-ai-web-dev-sdk')).default
      const zai = await ZAI.create()

      const completion = await zai.chat.completions.create({
        model: 'glm-4-flash',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.3,
      })

      const raw = completion?.choices?.[0]?.message?.content || ''

      // Parse JSON from LLM response
      const jsonMatch = raw.match(/\[[\s\S]*\]/)
      if (jsonMatch) {
        const parsed: RecommendationItem[] = JSON.parse(jsonMatch[0])

        // Validate and enrich recommendations
        const recommendations: RecommendationItem[] = parsed
          .slice(0, 3)
          .map((rec) => {
            // Find matching asset to ensure valid reference
            const matchingAsset = candidateAssets.find(
              (a) => a.slug === rec.assetId || a.id === rec.assetId || a.name === rec.assetName
            )
            return {
              assetId: matchingAsset ? matchingAsset.slug : rec.assetId,
              assetName: matchingAsset ? matchingAsset.name : rec.assetName,
              reason: rec.reason,
              score: Math.min(100, Math.max(0, rec.score || 70)),
              matchType: rec.matchType || 'diversification',
            }
          })

        // Cache the result
        recommendationCache.set(userId, {
          data: recommendations,
          timestamp: Date.now(),
        })

        // Clean up expired cache entries (prevent memory leak)
        for (const [key, val] of recommendationCache.entries()) {
          if (Date.now() - val.timestamp > CACHE_TTL_MS) {
            recommendationCache.delete(key)
          }
        }

        return NextResponse.json({ recommendations, cached: false })
      }
    } catch (sdkErr) {
      console.error('z-ai-web-dev-sdk error in recommendations:', sdkErr)
    }

    // Fallback: generate rule-based recommendations if LLM fails
    const fallbackRecs = generateFallbackRecommendations(
      userInvestments,
      candidateAssets,
      user.balance
    )

    recommendationCache.set(userId, {
      data: fallbackRecs,
      timestamp: Date.now(),
    })

    return NextResponse.json({ recommendations: fallbackRecs, cached: false })
  } catch (err) {
    console.error('Error generating recommendations:', err)
    return NextResponse.json(
      { error: 'Failed to generate recommendations' },
      { status: 500 }
    )
  }
}

// ─── Fallback rule-based recommendations ───────────────────────────────────────
function generateFallbackRecommendations(
  currentInvestments: { name: string; type: string; city: string; country: string; yield: number; riskLevel: string }[],
  availableAssets: {
    slug: string
    name: string
    type: string
    city: string
    country: string
    riskLevel: string
    annualYield: number
    pricePerFraction: number
    minimumInvestment: number
    fundedPercentage: number
    projectedAppreciation: number
  }[],
  balance: number
): RecommendationItem[] {
  // Score assets based on diversification from current portfolio
  const scored = availableAssets.map((asset) => {
    let score = 70 // base score
    let matchType = 'diversification'

    // Boost for different type from existing investments
    const types = new Set(currentInvestments.map((i) => i.type))
    if (!types.has(asset.type)) {
      score += 10
      matchType = 'diversification'
    }

    // Boost for different city/country
    const cities = new Set(currentInvestments.map((i) => i.city))
    if (!cities.has(asset.city)) {
      score += 8
      matchType = 'geographic'
    }

    // Boost for high yield
    if (asset.annualYield > 8) {
      score += 7
      matchType = 'yield'
    }

    // Boost for budget fit
    if (balance >= asset.minimumInvestment) {
      score += 5
      if (matchType === 'diversification') matchType = 'budget_fit'
    }

    // Boost for growth potential
    if (asset.projectedAppreciation > 5) {
      score += 5
      matchType = 'growth'
    }

    return {
      assetId: asset.slug,
      assetName: asset.name,
      reason: `${asset.name} in ${asset.city} offers ${asset.annualYield}% annual yield with ${asset.riskLevel} risk level. ${currentInvestments.length === 0 ? 'Great starting investment for portfolio diversification.' : `Complements your existing ${types.size} asset type${types.size > 1 ? 's' : ''}.`}`,
      score: Math.min(100, score),
      matchType,
    }
  })

  // Sort by score descending and return top 3
  return scored.sort((a, b) => b.score - a.score).slice(0, 3)
}
