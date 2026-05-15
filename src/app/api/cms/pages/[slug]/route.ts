import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// GET /api/cms/pages/[slug] — Get page by slug (public)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    const page = await db.cmsPage.findUnique({
      where: { slug },
    })

    if (!page) {
      return NextResponse.json({ error: 'Página no encontrada' }, { status: 404 })
    }

    if (!page.isPublished) {
      const session = await getServerSession(authOptions)
      const isAdmin = session?.user?.role === 'admin' || session?.user?.role === 'superadmin'
      if (!isAdmin) {
        return NextResponse.json({ error: 'Página no encontrada' }, { status: 404 })
      }
    }

    return NextResponse.json({ success: true, page })
  } catch (error) {
    console.error('CMS page get error:', error)
    return NextResponse.json({ error: 'Error loading page' }, { status: 500 })
  }
}

// PUT /api/cms/pages/[slug] — Update page (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || (session.user.role !== 'admin' && session.user.role !== 'superadmin')) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
    }

    const { slug } = await params
    const body = await request.json()

    const existing = await db.cmsPage.findUnique({ where: { slug } })
    if (!existing) {
      return NextResponse.json({ error: 'Página no encontrada' }, { status: 404 })
    }

    // If slug is being changed, check uniqueness
    if (body.slug && body.slug !== slug) {
      const slugExists = await db.cmsPage.findUnique({ where: { slug: body.slug } })
      if (slugExists) {
        return NextResponse.json({ error: 'Ya existe una página con ese slug' }, { status: 409 })
      }
    }

    const page = await db.cmsPage.update({
      where: { slug },
      data: {
        ...(body.title !== undefined ? { title: body.title } : {}),
        ...(body.slug !== undefined ? { slug: body.slug } : {}),
        ...(body.content !== undefined ? { content: body.content } : {}),
        ...(body.excerpt !== undefined ? { excerpt: body.excerpt } : {}),
        ...(body.category !== undefined ? { category: body.category } : {}),
        ...(body.icon !== undefined ? { icon: body.icon } : {}),
        ...(body.sortOrder !== undefined ? { sortOrder: body.sortOrder } : {}),
        ...(body.isPublished !== undefined ? { isPublished: body.isPublished } : {}),
        ...(body.seoTitle !== undefined ? { seoTitle: body.seoTitle || null } : {}),
        ...(body.seoDescription !== undefined ? { seoDescription: body.seoDescription || null } : {}),
        lastEditedBy: session.user.id,
        lastEditedAt: new Date(),
      },
    })

    return NextResponse.json({ success: true, page })
  } catch (error) {
    console.error('CMS page update error:', error)
    return NextResponse.json({ error: 'Error updating page' }, { status: 500 })
  }
}

// DELETE /api/cms/pages/[slug] — Delete page (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || (session.user.role !== 'admin' && session.user.role !== 'superadmin')) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
    }

    const { slug } = await params
    const existing = await db.cmsPage.findUnique({ where: { slug } })
    if (!existing) {
      return NextResponse.json({ error: 'Página no encontrada' }, { status: 404 })
    }

    await db.cmsPage.delete({ where: { slug } })

    return NextResponse.json({ success: true, message: 'Página eliminada' })
  } catch (error) {
    console.error('CMS page delete error:', error)
    return NextResponse.json({ error: 'Error deleting page' }, { status: 500 })
  }
}
