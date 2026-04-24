import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// GET /api/currencies — public, returns active currencies ordered by sortOrder
export async function GET() {
  try {
    const currencies = await db.currency.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    })
    return NextResponse.json(currencies)
  } catch (error) {
    console.error('GET /api/currencies error:', error)
    return NextResponse.json({ error: 'Failed to fetch currencies' }, { status: 500 })
  }
}

// POST /api/currencies — admin only, create a new currency
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || !['superadmin', 'admin'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { code, name, symbol, flag, sortOrder, isActive } = body

    if (!code || !name) {
      return NextResponse.json({ error: 'code and name are required' }, { status: 400 })
    }

    const existing = await db.currency.findUnique({ where: { code } })
    if (existing) {
      return NextResponse.json({ error: 'Currency already exists' }, { status: 409 })
    }

    const currency = await db.currency.create({
      data: {
        code,
        name,
        symbol: symbol || '',
        flag: flag || '',
        sortOrder: sortOrder ?? 0,
        isActive: isActive ?? true,
      },
    })

    return NextResponse.json(currency, { status: 201 })
  } catch (error) {
    console.error('POST /api/currencies error:', error)
    return NextResponse.json({ error: 'Failed to create currency' }, { status: 500 })
  }
}

// PUT /api/currencies — admin only, update a currency
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || !['superadmin', 'admin'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { code, name, symbol, flag, sortOrder, isActive } = body

    if (!code) {
      return NextResponse.json({ error: 'code is required' }, { status: 400 })
    }

    const existing = await db.currency.findUnique({ where: { code } })
    if (!existing) {
      return NextResponse.json({ error: 'Currency not found' }, { status: 404 })
    }

    const currency = await db.currency.update({
      where: { code },
      data: {
        ...(name !== undefined && { name }),
        ...(symbol !== undefined && { symbol }),
        ...(flag !== undefined && { flag }),
        ...(sortOrder !== undefined && { sortOrder }),
        ...(isActive !== undefined && { isActive }),
      },
    })

    return NextResponse.json(currency)
  } catch (error) {
    console.error('PUT /api/currencies error:', error)
    return NextResponse.json({ error: 'Failed to update currency' }, { status: 500 })
  }
}
