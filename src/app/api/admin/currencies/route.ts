import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/api-auth'

// GET /api/admin/currencies - List all currencies
export async function GET(request: Request) {
  const { error } = await requireAdmin(request.headers.get('cookie'))
  if (error) return error

  try {
    const currencies = await db.currency.findMany({
      orderBy: { sortOrder: 'asc' },
    })

    return NextResponse.json(currencies)
  } catch (error) {
    console.error('Error fetching currencies:', error)
    return NextResponse.json({ error: 'Failed to fetch currencies' }, { status: 500 })
  }
}

// POST /api/admin/currencies - Create new currency
export async function POST(request: Request) {
  const { error } = await requireAdmin(request.headers.get('cookie'))
  if (error) return error

  try {
    const body = await request.json()
    const { code, name, symbol, flag, sortOrder, isActive } = body

    if (!code || !name) {
      return NextResponse.json({ error: 'code and name are required' }, { status: 400 })
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
    console.error('Error creating currency:', error)
    return NextResponse.json({ error: 'Failed to create currency' }, { status: 500 })
  }
}
