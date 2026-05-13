import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// In-memory cache for search results: queryKey -> { results, expiresAt }
const searchCache = new Map<string, { results: unknown; expiresAt: number }>()
const CACHE_TTL_MS = 10 * 60 * 1000 // 10 minutes

const SYSTEM_PROMPT = `You are a search engine for a real estate investment platform called 3GSP. Given the user's search query and a list of available assets, return the IDs of the most relevant assets. Consider investment intent, asset types mentioned, locations, risk preferences, yield expectations, price ranges, and any other relevant criteria from the query.

You MUST respond ONLY with a valid JSON object in this exact format, no extra text:
{
  "matches": [
    { "assetId": "the_asset_id", "relevanceScore": 0.95, "reason": "Brief reason in Spanish" }
  ]
}

Guidelines:
- Only include assets that are genuinely relevant to the search query
- Relevance score should be between 0.1 and 1.0
- Sort matches by relevance score descending
- Include at most 10 matches (fewer if fewer are relevant)
- If no assets match, return an empty matches array
- Consider synonyms in Spanish/English (e.g., "departamento" = "apartment", "oficina" = "office")
- Consider locations, asset types, yields, prices, and investment goals mentioned in the query
- If the query is very general (e.g., "inmuebles"), return top-rated assets by yield`

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    const limitParam = searchParams.get('limit')
    const limit = limitParam ? Math.min(Math.max(parseInt(limitParam, 10) || 10, 1), 50) : 10

    if (!query || !query.trim()) {
      return NextResponse.json({ error: 'Search query parameter "q" is required' }, { status: 400 })
    }

    const normalizedQuery = query.trim().toLowerCase()
    const cacheKey = `search:${normalizedQuery}:${limit}`

    // Check cache
    const cached = searchCache.get(cacheKey)
    if (cached && cached.expiresAt > Date.now()) {
      return NextResponse.json(cached.results)
    }

    // Fetch all active assets with key fields for semantic matching
    const assets = await db.asset.findMany({
      where: { status: 'active' },
      select: {
        id: true,
        name: true,
        slug: true,
        type: true,
        status: true,
        city: true,
        region: true,
        country: true,
        totalValue: true,
        pricePerFraction: true,
        totalFractions: true,
        availableFractions: true,
        minimumInvestment: true,
        fundedPercentage: true,
        annualYield: true,
        projectedAppreciation: true,
        totalProjectedReturn: true,
        riskLevel: true,
        shortDescription: true,
        fullDescription: true,
        highlights: true,
        badge: true,
        dividendFrequency: true,
        leaseStatus: true,
        monthlyRent: true,
        totalArea: true,
        units: true,
        constructionYear: true,
        tags: true,
        images: {
          where: { isCover: true },
          take: 1,
          select: { url: true, alt: true },
        },
      },
    })

    if (assets.length === 0) {
      const emptyResult = { results: [], query: query.trim(), total: 0 }
      searchCache.set(cacheKey, { results: emptyResult, expiresAt: Date.now() + CACHE_TTL_MS })
      return NextResponse.json(emptyResult)
    }

    // Build a compact asset list for the LLM prompt
    const assetListForPrompt = assets.map((a) => ({
      id: a.id,
      name: a.name,
      type: a.type,
      city: a.city,
      region: a.region,
      country: a.country,
      pricePerFraction: a.pricePerFraction,
      annualYield: a.annualYield,
      projectedAppreciation: a.projectedAppreciation,
      fundedPercentage: a.fundedPercentage,
      riskLevel: a.riskLevel,
      minimumInvestment: a.minimumInvestment,
      shortDescription: a.shortDescription,
      highlights: a.highlights,
      tags: a.tags,
      leaseStatus: a.leaseStatus,
      totalArea: a.totalArea,
      units: a.units,
    }))

    const userPrompt = `Busca activos relevantes para esta consulta: "${query}"

Activos disponibles (${assets.length}):
${JSON.stringify(assetListForPrompt, null, 2)}

Encuentra los activos más relevantes y devuélvelos en formato JSON con IDs, puntajes de relevancia y razones. Responde SOLO con el JSON.`

    let matchedIds: string[] = []

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

      const reply = completion?.choices?.[0]?.message?.content || ''
      const jsonMatch = reply.match(/\{[\s\S]*\}/)

      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0])
        if (parsed.matches && Array.isArray(parsed.matches)) {
          // Validate that returned IDs exist in our asset list
          const assetIds = new Set(assets.map((a) => a.id))
          matchedIds = parsed.matches
            .filter((m: { assetId: string; relevanceScore: number }) => assetIds.has(m.assetId))
            .sort((a: { relevanceScore: number }, b: { relevanceScore: number }) => b.relevanceScore - a.relevanceScore)
            .map((m: { assetId: string }) => m.assetId)
            .slice(0, limit)
        }
      }
    } catch (sdkErr) {
      console.error('z-ai-web-dev-sdk error in search:', sdkErr)
      // Fallback to basic text matching
      matchedIds = fallbackTextSearch(normalizedQuery, assets, limit)
    }

    // If no matches from LLM, fallback to basic text search
    if (matchedIds.length === 0) {
      matchedIds = fallbackTextSearch(normalizedQuery, assets, limit)
    }

    // Fetch full asset details for matched IDs
    const matchedAssets = matchedIds.length > 0
      ? await db.asset.findMany({
          where: { id: { in: matchedIds } },
          include: {
            images: {
              where: { isCover: true },
              take: 1,
              select: { url: true, alt: true },
            },
          },
        })
      : []

    // Maintain LLM relevance order
    const orderedResults = matchedIds
      .map((id) => matchedAssets.find((a) => a.id === id))
      .filter(Boolean)

    const result = {
      results: orderedResults,
      query: query.trim(),
      total: orderedResults.length,
    }

    // Cache result
    searchCache.set(cacheKey, { results: result, expiresAt: Date.now() + CACHE_TTL_MS })

    return NextResponse.json(result)
  } catch (err) {
    console.error('Asset search API error:', err)
    return NextResponse.json({ error: 'Failed to search assets' }, { status: 500 })
  }
}

/**
 * Fallback text-based search when LLM is unavailable
 * Searches across name, type, city, description, and tags
 */
function fallbackTextSearch(query: string, assets: { id: string; name: string; type: string; city: string; region: string; shortDescription: string; tags: string | null; highlights: string | null }[], limit: number): string[] {
  const queryWords = query.split(/\s+/).filter(Boolean)

  // Synonym mapping for common search terms
  const synonyms: Record<string, string[]> = {
    apartment: ['departamento', 'depto', 'apartamento', 'flat'],
    depto: ['departamento', 'apartamento', 'apartment'],
    departamento: ['depto', 'apartamento', 'apartment'],
    house: ['casa', 'vivienda'],
    casa: ['house', 'vivienda'],
    office: ['oficina', 'commercial'],
    oficina: ['office'],
    retail: ['comercial', 'tienda', 'store'],
    comercial: ['retail', 'tienda', 'store'],
    warehouse: ['bodega', 'almacen', 'storage'],
    bodega: ['warehouse', 'almacen'],
    land: ['terreno', 'lote', 'plot'],
    terreno: ['land', 'lote', 'plot'],
    high: ['alto', 'elevado', 'premium'],
    bajo: ['low', 'bajo'],
    rent: ['arriendo', 'alquiler', 'renta'],
    arriendo: ['rent', 'alquiler'],
    santiago: ['stgo', 'rm', 'metropolitana'],
    beach: ['playa', 'costa', 'costero'],
    playa: ['beach', 'costa'],
  }

  const expandedWords = new Set(queryWords)
  for (const word of queryWords) {
    const mapped = synonyms[word]
    if (mapped) mapped.forEach((s) => expandedWords.add(s))
  }

  const scored = assets.map((asset) => {
    let score = 0

    // Build searchable text
    const searchText = [
      asset.name,
      asset.type,
      asset.city,
      asset.region,
      asset.shortDescription,
      asset.tags || '',
      asset.highlights || '',
    ].join(' ').toLowerCase()

    for (const word of expandedWords) {
      if (asset.name.toLowerCase().includes(word)) score += 5
      if (asset.type.toLowerCase().includes(word)) score += 4
      if (asset.city.toLowerCase().includes(word)) score += 3
      if (asset.region.toLowerCase().includes(word)) score += 2
      if (asset.shortDescription.toLowerCase().includes(word)) score += 1
      if ((asset.tags || '').toLowerCase().includes(word)) score += 2
      if ((asset.highlights || '').toLowerCase().includes(word)) score += 1
    }

    return { id: asset.id, score }
  })

  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((s) => s.id)
}
