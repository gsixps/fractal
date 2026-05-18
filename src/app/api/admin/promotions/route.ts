import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/api-auth'

// GET /api/admin/promotions - List all promotions
export async function GET(request: Request) {
  const { error } = await requireAdmin(request.headers.get('cookie'))
  if (error) return error

  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    const where: Record<string, unknown> = {}
    if (status === 'active') where.isActive = true
    else if (status === 'inactive') where.isActive = false

    const promotions = await db.promotion.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(promotions)
  } catch (error) {
    console.error('Error fetching promotions:', error)
    return NextResponse.json({ error: 'Failed to fetch promotions' }, { status: 500 })
  }
}

// POST /api/admin/promotions - Create new promotion
export async function POST(request: Request) {
  const { error } = await requireAdmin(request.headers.get('cookie'))
  if (error) return error

  try {
    const body = await request.json()
    const { name, code, type, value, minInvestment, validFrom, validTo, maxUses, assetTypes, description, isActive } = body

    if (!name || !code || !validFrom) {
      return NextResponse.json({ error: 'name, code, and validFrom are required' }, { status: 400 })
    }

    const promotion = await db.promotion.create({
      data: {
        name,
        code,
        type: type || 'bonus_yield',
        value: value ?? 0,
        minInvestment,
        validFrom: new Date(validFrom),
        validTo: validTo ? new Date(validTo) : null,
        maxUses,
        assetTypes,
        description,
        isActive: isActive ?? true,
      },
    })

    return NextResponse.json(promotion, { status: 201 })
  } catch (error) {
    console.error('Error creating promotion:', error)
    return NextResponse.json({ error: 'Failed to create promotion' }, { status: 500 })
  }
}
