import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/api-auth'
import { db } from '@/lib/db'

interface FraudCheckRequest {
  type: 'investment' | 'referral' | 'login'
  data: Record<string, unknown>
}

interface FraudCheckResponse {
  riskScore: number
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
  factors: string[]
  recommendation: string
}

const SYSTEM_PROMPT = `You are a fraud detection AI for a financial platform called 3GSP by GALAXY LLC. Analyze the following transaction/user data and return a risk assessment.

You MUST respond with valid JSON only — no markdown, no explanation outside the JSON. The JSON must have exactly this shape:
{
  "riskScore": 42,
  "riskLevel": "medium",
  "factors": ["factor 1", "factor 2"],
  "recommendation": "What action the platform should take"
}

Risk level mapping:
- 0-25: "low" — transaction appears normal
- 26-50: "medium" — some concerns, proceed with caution
- 51-75: "high" — significant risk indicators, require manual review
- 76-100: "critical" — block transaction immediately and escalate

Consider these factors:
- Investment checks: unusually large amounts vs user history, frequency of recent investments, amount significantly above average for the user
- Referral checks: multiple referrals in short time windows, referred emails that look fake or generic (test@, abc@, etc.), suspicious patterns
- Login checks: geographic anomalies, unusual timing patterns, rapid successive logins from different contexts

Be specific in factors and recommendations. Keep factors concise (max 15 words each). Recommendation should be actionable.`

export async function POST(request: Request) {
  const { error, session } = await requireAuth(request.headers.get('cookie'))
  if (error) return error

  try {
    const body: FraudCheckRequest = await request.json()
    const { type, data } = body

    if (!type || !data) {
      return NextResponse.json(
        { error: 'type and data are required' },
        { status: 400 }
      )
    }

    if (!['investment', 'referral', 'login'].includes(type)) {
      return NextResponse.json(
        { error: 'type must be one of: investment, referral, login' },
        { status: 400 }
      )
    }

    const userId = session!.user!.id

    // Gather user context from database
    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        balance: true,
        totalInvested: true,
        totalEarnings: true,
        kycStatus: true,
        riskProfile: true,
        createdAt: true,
        lastLoginAt: true,
        investments: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          select: {
            totalAmount: true,
            createdAt: true,
            status: true,
            asset: { select: { name: true, type: true } },
          },
        },
        referrals: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          select: {
            createdAt: true,
            status: true,
            referred: { select: { email: true, createdAt: true } },
          },
        },
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Build context data based on check type
    const userContext = buildUserContext(user, type, data)

    // Use z-ai-web-dev-sdk for AI-powered fraud analysis
    try {
      const ZAI = (await import('z-ai-web-dev-sdk')).default
      const zai = await ZAI.create()

      const completion = await zai.chat.completions.create({
        model: 'glm-4-flash',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userContext },
        ],
        temperature: 0.1, // Low temperature for consistent, deterministic analysis
      })

      const raw = completion?.choices?.[0]?.message?.content || ''

      // Parse JSON from LLM response
      const jsonMatch = raw.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0])

        const result: FraudCheckResponse = {
          riskScore: Math.min(100, Math.max(0, Number(parsed.riskScore) || 0)),
          riskLevel: validateRiskLevel(parsed.riskLevel),
          factors: Array.isArray(parsed.factors)
            ? parsed.factors.slice(0, 8)
            : ['Analysis inconclusive'],
          recommendation:
            typeof parsed.recommendation === 'string'
              ? parsed.recommendation
              : 'Manual review recommended',
        }

        // Log high-risk events for audit trail
        if (result.riskScore >= 50) {
          await db.auditLog.create({
            data: {
              userId,
              action: 'fraud_check_high_risk',
              entity: type,
              details: JSON.stringify({
                riskScore: result.riskScore,
                riskLevel: result.riskLevel,
                factors: result.factors,
                requestData: sanitizeData(data),
              }),
            },
          })
        }

        return NextResponse.json(result)
      }
    } catch (sdkErr) {
      console.error('z-ai-web-dev-sdk error in fraud check:', sdkErr)
    }

    // Fallback: rule-based fraud detection
    const fallbackResult = ruleBasedFraudCheck(user, type, data)

    // Log high-risk events
    if (fallbackResult.riskScore >= 50) {
      await db.auditLog.create({
        data: {
          userId,
          action: 'fraud_check_high_risk',
          entity: type,
          details: JSON.stringify({
            riskScore: fallbackResult.riskScore,
            riskLevel: fallbackResult.riskLevel,
            factors: fallbackResult.factors,
            source: 'fallback_rules',
          }),
        },
      })
    }

    return NextResponse.json(fallbackResult)
  } catch (err) {
    console.error('Error in fraud check:', err)
    return NextResponse.json(
      { error: 'Failed to perform fraud check' },
      { status: 500 }
    )
  }
}

// ─── Build context prompt for the LLM ──────────────────────────────────────────
function buildUserContext(
  user: {
    email: string
    name: string | null
    balance: number
    totalInvested: number
    totalEarnings: number
    kycStatus: string
    riskProfile: string | null
    createdAt: Date
    lastLoginAt: Date | null
    investments: { totalAmount: number; createdAt: Date; status: string; asset: { name: string; type: string } }[]
    referrals: { createdAt: Date; status: string; referred: { email: string; createdAt: Date } }[]
  },
  type: string,
  data: Record<string, unknown>
): string {
  const now = new Date()
  const accountAgeDays = Math.floor(
    (now.getTime() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24)
  )

  let context = `## User Account Information
- Account Age: ${accountAgeDays} days
- Email: ${user.email}
- KYC Status: ${user.kycStatus}
- Risk Profile: ${user.riskProfile || 'not set'}
- Total Invested: $${user.totalInvested.toLocaleString('en-US')} USD
- Available Balance: $${user.balance.toLocaleString('en-US')} USD
- Total Earnings: $${user.totalEarnings.toLocaleString('en-US')} USD
- Last Login: ${user.lastLoginAt ? new Date(user.lastLoginAt).toISOString() : 'unknown'}`

  if (type === 'investment') {
    const investmentData = data
    const amount = Number(investmentData.amount) || 0
    const avgInvestment =
      user.investments.length > 0
        ? user.investments.reduce((sum, i) => sum + i.totalAmount, 0) /
          user.investments.length
        : 0

    // Recent investments (last 7 days)
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const recentInvestments = user.investments.filter(
      (i) => new Date(i.createdAt) >= sevenDaysAgo
    )

    context += `

## Current Transaction Being Checked (INVESTMENT)
- Investment Amount: $${amount.toLocaleString('en-US')} USD
- Asset: ${investmentData.assetName || 'unknown'}
- ${investmentData.assetType ? `Asset Type: ${investmentData.assetType}` : ''}

## Investment History
- Total Investments: ${user.investments.length}
- Average Investment Amount: $${avgInvestment.toLocaleString('en-US')} USD
- Investments in Last 7 Days: ${recentInvestments.length}
- ${recentInvestments.length > 0
        ? `Recent Investment Amounts: ${recentInvestments.map((i) => `$${i.totalAmount.toLocaleString('en-US')}`).join(', ')}`
        : 'No recent investments'
      }
- Largest Previous Investment: $${Math.max(...user.investments.map((i) => i.totalAmount), 0).toLocaleString('en-US')} USD
- Amount vs Average Ratio: ${avgInvestment > 0 ? (amount / avgInvestment).toFixed(2) + 'x' : 'N/A (first investment)'}

${investmentData.ip ? `- IP Address: ${investmentData.ip}` : ''}
${investmentData.userAgent ? `- User Agent: ${String(investmentData.userAgent).substring(0, 100)}` : ''}
${investmentData.deviceFingerprint ? `- Device Fingerprint: ${investmentData.deviceFingerprint}` : ''}`
  } else if (type === 'referral') {
    const referralData = data
    const referredEmail = String(referralData.referredEmail || '')

    context += `

## Current Transaction Being Checked (REFERRAL)
- Referred Email: ${referredEmail}
- ${referralData.referralCode ? `Referral Code: ${referralData.referralCode}` : ''}

## Referral History
- Total Referrals Made: ${user.referrals.length}
- Referral Statuses: ${user.referrals.map((r) => r.status).join(', ') || 'none'}
- ${user.referrals.length > 0
        ? `Recent Referral Emails: ${user.referrals.slice(0, 5).map((r) => r.referred.email).join(', ')}`
        : 'No previous referrals'
      }
- Referral Timestamps: ${user.referrals.length > 0
        ? user.referrals
            .slice(0, 5)
            .map((r) => new Date(r.createdAt).toISOString())
            .join(', ')
        : 'none'
      }`
  } else if (type === 'login') {
    const loginData = data

    context += `

## Current Transaction Being Checked (LOGIN)
- Current IP: ${loginData.ip || 'unknown'}
- ${loginData.country ? `Detected Country: ${loginData.country}` : ''}
- ${loginData.city ? `Detected City: ${loginData.city}` : ''}
- ${loginData.userAgent ? `- User Agent: ${String(loginData.userAgent).substring(0, 100)}` : ''}
- ${loginData.deviceFingerprint ? `- Device Fingerprint: ${loginData.deviceFingerprint}` : ''}

## Login History
- Last Login: ${user.lastLoginAt ? new Date(user.lastLoginAt).toISOString() : 'unknown'}
- Account Age: ${accountAgeDays} days
- ${accountAgeDays < 1 ? 'NEW ACCOUNT WARNING: Account created less than 24 hours ago' : ''}
- ${loginData.ip && user.lastLoginAt ? `Time since last login: ${Math.floor((now.getTime() - new Date(user.lastLoginAt!).getTime()) / (1000 * 60 * 60))} hours` : ''}`
  }

  context += `\n\nAnalyze this data and return a JSON fraud risk assessment.`
  return context
}

// ─── Fallback rule-based fraud detection ───────────────────────────────────────
function ruleBasedFraudCheck(
  user: {
    balance: number
    totalInvested: number
    createdAt: Date
    investments: { totalAmount: number; createdAt: Date; status: string }[]
    referrals: { createdAt: Date; referred: { email: string } }[]
  },
  type: string,
  data: Record<string, unknown>
): FraudCheckResponse {
  let riskScore = 10 // Base risk score
  const factors: string[] = []

  const now = new Date()
  const accountAgeDays = Math.floor(
    (now.getTime() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24)
  )

  // New account risk
  if (accountAgeDays < 1) {
    riskScore += 15
    factors.push('Account created less than 24 hours ago')
  } else if (accountAgeDays < 7) {
    riskScore += 5
    factors.push('Account less than 7 days old')
  }

  if (type === 'investment') {
    const amount = Number(data.amount) || 0

    // Large amount vs history
    const avgInvestment =
      user.investments.length > 0
        ? user.investments.reduce((sum, i) => sum + i.totalAmount, 0) /
          user.investments.length
        : 0

    if (avgInvestment > 0 && amount > avgInvestment * 5) {
      riskScore += 30
      factors.push(
        `Investment amount ($${amount.toLocaleString('en-US')}) is ${((amount / avgInvestment)).toFixed(1)}x the user's average ($${avgInvestment.toLocaleString('en-US')})`
      )
    } else if (avgInvestment > 0 && amount > avgInvestment * 3) {
      riskScore += 15
      factors.push(
        `Investment amount ($${amount.toLocaleString('en-US')}) is ${((amount / avgInvestment)).toFixed(1)}x the user's average`
      )
    }

    // Amount exceeds balance
    if (amount > user.balance) {
      riskScore += 25
      factors.push(
        `Investment amount ($${amount.toLocaleString('en-US')}) exceeds available balance ($${user.balance.toLocaleString('en-US')})`
      )
    }

    // Frequent recent investments
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const recentCount = user.investments.filter(
      (i) => new Date(i.createdAt) >= sevenDaysAgo
    ).length

    if (recentCount >= 5) {
      riskScore += 20
      factors.push(`${recentCount} investments in the last 7 days (unusual frequency)`)
    } else if (recentCount >= 3) {
      riskScore += 10
      factors.push(`${recentCount} investments in the last 7 days`)
    }
  } else if (type === 'referral') {
    const referredEmail = String(data.referredEmail || '').toLowerCase()

    // Check for fake-looking emails
    const fakePatterns = [
      /^test[0-9]*@/i,
      /^abc[0-9]*@/i,
      /^example@/i,
      /^user[0-9]*@/i,
      /^temp[0-9]*@/i,
      /^fake[0-9]*@/i,
      /^\w{1,2}@/, // Very short prefix
    ]

    const isFakeEmail = fakePatterns.some((pattern) => pattern.test(referredEmail))
    if (isFakeEmail) {
      riskScore += 35
      factors.push(`Referred email "${referredEmail}" appears to be a test/fake email`)
    }

    // Check for rapid referrals
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000)
    const recentReferrals = user.referrals.filter(
      (r) => new Date(r.createdAt) >= oneHourAgo
    ).length

    if (recentReferrals >= 3) {
      riskScore += 25
      factors.push(`${recentReferrals} referrals submitted in the last hour`)
    } else if (recentReferrals >= 2) {
      riskScore += 10
      factors.push(`${recentReferrals} referrals submitted in the last hour`)
    }
  } else if (type === 'login') {
    // IP-based anomaly detection would go here with more infrastructure
    // For now, we flag new account + unusual time patterns
    if (accountAgeDays < 1 && data.ip) {
      riskScore += 10
      factors.push('New account with login attempt')
    }
  }

  // Clamp score
  riskScore = Math.min(100, Math.max(0, riskScore))

  // Determine risk level
  let riskLevel: FraudCheckResponse['riskLevel'] = 'low'
  if (riskScore >= 76) riskLevel = 'critical'
  else if (riskScore >= 51) riskLevel = 'high'
  else if (riskScore >= 26) riskLevel = 'medium'

  // Generate recommendation
  let recommendation: string
  if (riskLevel === 'critical') {
    recommendation =
      'Block transaction immediately and flag for security team review. Require additional verification before any action.'
  } else if (riskLevel === 'high') {
    recommendation =
      'Hold transaction for manual review by compliance team. Request additional identity verification from the user.'
  } else if (riskLevel === 'medium') {
    recommendation =
      'Allow transaction but monitor closely. Send security notification to user. Consider step-up authentication.'
  } else {
    recommendation =
      'Transaction appears normal. Proceed with standard processing.'
  }

  if (factors.length === 0) {
    factors.push('No significant risk factors detected')
  }

  return { riskScore, riskLevel, factors, recommendation }
}

// ─── Helpers ────────────────────────────────────────────────────────────────────
function validateRiskLevel(
  level: unknown
): 'low' | 'medium' | 'high' | 'critical' {
  const validLevels = ['low', 'medium', 'high', 'critical']
  if (typeof level === 'string' && validLevels.includes(level)) {
    return level as 'low' | 'medium' | 'high' | 'critical'
  }
  // Map numeric risk to level
  return 'medium'
}

function sanitizeData(data: Record<string, unknown>): Record<string, unknown> {
  const sanitized: Record<string, unknown> = {}
  const sensitiveKeys = ['password', 'token', 'secret', 'creditCard', 'ssn']

  for (const [key, value] of Object.entries(data)) {
    if (sensitiveKeys.some((s) => key.toLowerCase().includes(s))) {
      sanitized[key] = '[REDACTED]'
    } else if (typeof value === 'string' && value.length > 200) {
      sanitized[key] = value.substring(0, 200) + '...'
    } else {
      sanitized[key] = value
    }
  }

  return sanitized
}
