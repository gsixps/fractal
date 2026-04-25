import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/api-auth'

// GET /api/admin/currencies/[id] - Get a single currency
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { error } = await requireAdmin()
  if (error) return error

  try {
    const { id } = await params
    const currency = await db.currency.findUnique({
      where: { id },
    })

    if (!currency) {
      return NextResponse.json({ error: 'Currency not found' }, { status: 404 })
    }

    return NextResponse.json(currency)
  } catch (error) {
    console.error('Error fetching currency:', error)
    return NextResponse.json({ error: 'Failed to fetch currency' }, { status: 500 })
  }
}

// PUT /api/admin/currencies/[id] - Update a currency
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { error } = await requireAdmin()
  if (error) return error

  try {
    const { id } = await params
    const body = await request.json()

    const existing = await db.currency.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Currency not found' }, { status: 404 })
    }

    const { code, name, symbol, flag, sortOrder, isActive } = body

    const currency = await db.currency.update({
      where: { id },
      data: {
        ...(code !== undefined && { code }),
        ...(name !== undefined && { name }),
        ...(symbol !== undefined && { symbol }),
        ...(flag !== undefined && { flag }),
        ...(sortOrder !== undefined && { sortOrder }),
        ...(isActive !== undefined && { isActive }),
      },
    })

    return NextResponse.json(currency)
  } catch (error) {
    console.error('Error updating currency:', error)
    return NextResponse.json({ error: 'Failed to update currency' }, { status: 500 })
  }
}

// DELETE /api/admin/currencies/[id] - Delete a currency
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { error } = await requireAdmin()
  if (error) return error

  try {
    const { id } = await params

    const existing = await db.currency.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Currency not found' }, { status: 404 })
    }

    await db.currency.delete({ where: { id } })

    return NextResponse.json({ message: 'Currency deleted successfully' })
  } catch (error) {
    console.error('Error deleting currency:', error)
    return NextResponse.json({ error: 'Failed to delete currency' }, { status: 500 })
  }
}
