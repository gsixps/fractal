import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/api-auth'

// GET /api/admin/asset-types - List all asset types
export async function GET(request: Request) {
  const { error } = await requireAdmin(request.headers.get('cookie'))
  if (error) return error

  try {
    const assetTypes = await db.assetType.findMany({
      orderBy: { sortOrder: 'asc' },
    })

    return NextResponse.json({ assetTypes })
  } catch (error) {
    console.error('Error fetching asset types:', error)
    return NextResponse.json({ error: 'Failed to fetch asset types' }, { status: 500 })
  }
}

// POST /api/admin/asset-types - Create new asset type
export async function POST(request: Request) {
  const { error } = await requireAdmin(request.headers.get('cookie'))
  if (error) return error

  try {
    const body = await request.json()
    const { name, slug, icon, description, color, sortOrder, isActive } = body

    if (!name || !slug) {
      return NextResponse.json({ error: 'name and slug are required' }, { status: 400 })
    }

    // Validate name uniqueness
    const existingName = await db.assetType.findUnique({ where: { name } })
    if (existingName) {
      return NextResponse.json({ error: 'An asset type with this name already exists' }, { status: 409 })
    }

    // Validate slug uniqueness
    const existingSlug = await db.assetType.findUnique({ where: { slug } })
    if (existingSlug) {
      return NextResponse.json({ error: 'An asset type with this slug already exists' }, { status: 409 })
    }

    const assetType = await db.assetType.create({
      data: {
        name,
        slug: slug.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, ''),
        icon: icon || null,
        description: description || null,
        color: color || '#059669',
        sortOrder: sortOrder ?? 0,
        isActive: isActive ?? true,
      },
    })

    return NextResponse.json(assetType, { status: 201 })
  } catch (error) {
    console.error('Error creating asset type:', error)
    return NextResponse.json({ error: 'Failed to create asset type' }, { status: 500 })
  }
}
