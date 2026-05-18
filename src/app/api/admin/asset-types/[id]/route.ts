import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/api-auth'

// PUT /api/admin/asset-types/[id] - Update asset type
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdmin(request.headers.get('cookie'))
  if (error) return error

  try {
    const { id } = await params
    const body = await request.json()

    const existing = await db.assetType.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Asset type not found' }, { status: 404 })
    }

    const { name, slug, icon, description, color, sortOrder, isActive } = body

    // Validate name uniqueness if changing
    if (name && name !== existing.name) {
      const existingName = await db.assetType.findUnique({ where: { name } })
      if (existingName) {
        return NextResponse.json({ error: 'An asset type with this name already exists' }, { status: 409 })
      }
    }

    // Validate slug uniqueness if changing
    if (slug && slug !== existing.slug) {
      const normalizedSlug = slug.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '')
      const existingSlug = await db.assetType.findUnique({ where: { slug: normalizedSlug } })
      if (existingSlug) {
        return NextResponse.json({ error: 'An asset type with this slug already exists' }, { status: 409 })
      }
    }

    const assetType = await db.assetType.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(slug !== undefined && { slug: slug.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '') }),
        ...(icon !== undefined && { icon: icon || null }),
        ...(description !== undefined && { description: description || null }),
        ...(color !== undefined && { color }),
        ...(sortOrder !== undefined && { sortOrder }),
        ...(isActive !== undefined && { isActive }),
      },
    })

    return NextResponse.json(assetType)
  } catch (error) {
    console.error('Error updating asset type:', error)
    return NextResponse.json({ error: 'Failed to update asset type' }, { status: 500 })
  }
}

// DELETE /api/admin/asset-types/[id] - Delete asset type
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdmin(request.headers.get('cookie'))
  if (error) return error

  try {
    const { id } = await params

    const existing = await db.assetType.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Asset type not found' }, { status: 404 })
    }

    await db.assetType.delete({ where: { id } })

    return NextResponse.json({ message: 'Asset type deleted successfully' })
  } catch (error) {
    console.error('Error deleting asset type:', error)
    return NextResponse.json({ error: 'Failed to delete asset type' }, { status: 500 })
  }
}
