import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/api-auth'

// GET /api/admin/assets — List all assets with filters
export async function GET(request: NextRequest) {
  const { error } = await requireAdmin(request.headers.get('cookie'))
  if (error) return error

  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const status = searchParams.get('status')
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = parseInt(searchParams.get('limit') || '20', 10)
    const skip = (page - 1) * limit

    const where: Record<string, unknown> = {}

    if (type) where.type = type
    if (status) where.status = status
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { city: { contains: search } },
        { address: { contains: search } },
      ]
    }

    const [assets, total] = await Promise.all([
      db.asset.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          images: { orderBy: { sortOrder: 'asc' } },
          documents: true,
          cashFlowProjections: { orderBy: { period: 'asc' } },
          investments: {
            select: { id: true },
          },
        },
      }),
      db.asset.count({ where }),
    ])

    const assetsWithCount = assets.map((asset) => ({
      ...asset,
      investmentCount: asset.investments.length,
      investments: undefined,
    }))

    return NextResponse.json({
      assets: assetsWithCount,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error listing assets:', error)
    return NextResponse.json(
      { error: 'Failed to list assets' },
      { status: 500 }
    )
  }
}

// POST /api/admin/assets — Create a new asset
export async function POST(request: NextRequest) {
  const { error } = await requireAdmin(request.headers.get('cookie'))
  if (error) return error

  try {
    const body = await request.json()

    // Generate slug from name
    const slug = body.slug || body.name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '')

    // Check for duplicate slug
    const existing = await db.asset.findUnique({ where: { slug } })
    if (existing) {
      return NextResponse.json(
        { error: 'An asset with this slug already exists' },
        { status: 409 }
      )
    }

    const asset = await db.asset.create({
      data: {
        name: body.name,
        slug,
        type: body.type,
        status: body.status || 'draft',
        address: body.address || '',
        city: body.city || '',
        region: body.region || '',
        country: body.country || 'Chile',
        latitude: body.latitude,
        longitude: body.longitude,
        totalValue: body.totalValue || 0,
        pricePerFraction: body.pricePerFraction || 0,
        totalFractions: body.totalFractions || 0,
        availableFractions: (body.availableFractions ?? body.totalFractions) || 0,
        minimumInvestment: body.minimumInvestment || 0,
        fundedPercentage: body.fundedPercentage || 0,
        annualYield: body.annualYield || 0,
        projectedAppreciation: body.projectedAppreciation || 0,
        totalProjectedReturn: body.totalProjectedReturn || 0,
        leaseStatus: body.leaseStatus || 'vacant',
        leaseStart: body.leaseStart ? new Date(body.leaseStart) : null,
        leaseEnd: body.leaseEnd ? new Date(body.leaseEnd) : null,
        monthlyRent: body.monthlyRent,
        tenantName: body.tenantName,
        totalArea: body.totalArea,
        units: body.units,
        constructionYear: body.constructionYear,
        landUse: body.landUse,
        shortDescription: body.shortDescription || '',
        fullDescription: body.fullDescription || '',
        highlights: body.highlights || '',
        badge: body.badge,
        operationalCosts: body.operationalCosts,
        operationalCostsPct: body.operationalCostsPct,
        images: body.images
          ? {
              create: body.images.map(
                (img: { url: string; alt?: string; sortOrder?: number; isCover?: boolean }, i: number) => ({
                  url: img.url,
                  alt: img.alt || '',
                  sortOrder: img.sortOrder ?? i,
                  isCover: img.isCover ?? i === 0,
                })
              ),
            }
          : undefined,
        documents: body.documents
          ? {
              create: body.documents.map(
                (doc: { title: string; documentType: string; fileUrl: string; fileSize?: number }) => ({
                  title: doc.title,
                  documentType: doc.documentType,
                  fileUrl: doc.fileUrl,
                  fileSize: doc.fileSize,
                })
              ),
            }
          : undefined,
        cashFlowProjections: body.cashFlowProjections
          ? {
              create: body.cashFlowProjections.map(
                (cfp: {
                  period: string
                  periodType?: string
                  grossIncome: number
                  operationalCost: number
                  netIncome: number
                  appreciation?: number
                  totalReturn?: number
                  cumulativeReturn?: number
                }) => ({
                  period: cfp.period,
                  periodType: cfp.periodType || 'yearly',
                  grossIncome: cfp.grossIncome,
                  operationalCost: cfp.operationalCost,
                  netIncome: cfp.netIncome,
                  appreciation: cfp.appreciation,
                  totalReturn: cfp.totalReturn,
                  cumulativeReturn: cfp.cumulativeReturn,
                })
              ),
            }
          : undefined,
      },
      include: {
        images: { orderBy: { sortOrder: 'asc' } },
        documents: true,
        cashFlowProjections: { orderBy: { period: 'asc' } },
      },
    })

    return NextResponse.json({ asset }, { status: 201 })
  } catch (error) {
    console.error('Error creating asset:', error)
    return NextResponse.json(
      { error: 'Failed to create asset' },
      { status: 500 }
    )
  }
}
