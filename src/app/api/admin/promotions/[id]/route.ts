import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/api-auth'

// PUT /api/admin/promotions/[id] - Update promotion
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdmin()
  if (error) return error

  try {
    const { id } = await params
    const body = await request.json()

    const existing = await db.promotion.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Promotion not found' }, { status: 404 })
    }

    const { name, code, type, value, minInvestment, validFrom, validTo, maxUses, assetTypes, description, isActive } = body

    const promotion = await db.promotion.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(code !== undefined && { code }),
        ...(type !== undefined && { type }),
        ...(value !== undefined && { value }),
        ...(minInvestment !== undefined && { minInvestment }),
        ...(validFrom !== undefined && { validFrom: new Date(validFrom) }),
        ...(validTo !== undefined && { validTo: validTo ? new Date(validTo) : null }),
        ...(maxUses !== undefined && { maxUses }),
        ...(assetTypes !== undefined && { assetTypes }),
        ...(description !== undefined && { description }),
        ...(isActive !== undefined && { isActive }),
      },
    })

    return NextResponse.json(promotion)
  } catch (error) {
    console.error('Error updating promotion:', error)
    return NextResponse.json({ error: 'Failed to update promotion' }, { status: 500 })
  }
}

// DELETE /api/admin/promotions/[id] - Delete promotion
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdmin()
  if (error) return error

  try {
    const { id } = await params

    const existing = await db.promotion.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Promotion not found' }, { status: 404 })
    }

    await db.promotion.delete({ where: { id } })

    return NextResponse.json({ message: 'Promotion deleted successfully' })
  } catch (error) {
    console.error('Error deleting promotion:', error)
    return NextResponse.json({ error: 'Failed to delete promotion' }, { status: 500 })
  }
}
