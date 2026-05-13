import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// GET /api/cms/pages — List all published pages (public)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const includeUnpublished = searchParams.get('all') === 'true'

    const session = await getServerSession(authOptions)
    const isAdmin = session?.user?.role === 'admin' || session?.user?.role === 'superadmin'

    const pages = await db.cmsPage.findMany({
      where: {
        ...(category ? { category } : {}),
        ...(!includeUnpublished && !isAdmin ? { isPublished: true } : {}),
      },
      orderBy: [{ sortOrder: 'asc' }, { title: 'asc' }],
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        category: true,
        icon: true,
        sortOrder: true,
        isPublished: true,
        updatedAt: true,
      },
    })

    return NextResponse.json({ success: true, pages })
  } catch (error) {
    console.error('CMS pages list error:', error)
    return NextResponse.json({ error: 'Error loading pages' }, { status: 500 })
  }
}

// POST /api/cms/pages — Create new page (admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || (session.user.role !== 'admin' && session.user.role !== 'superadmin')) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
    }

    const body = await request.json()
    const { title, slug, content, excerpt, category, icon, sortOrder, isPublished, seoTitle, seoDescription } = body

    if (!title || !slug) {
      return NextResponse.json({ error: 'Título y slug son requeridos' }, { status: 400 })
    }

    // Check if slug already exists
    const existing = await db.cmsPage.findUnique({ where: { slug } })
    if (existing) {
      return NextResponse.json({ error: 'Ya existe una página con ese slug' }, { status: 409 })
    }

    const page = await db.cmsPage.create({
      data: {
        title,
        slug,
        content: content || '',
        excerpt: excerpt || '',
        category: category || 'company',
        icon: icon || 'FileText',
        sortOrder: sortOrder ?? 0,
        isPublished: isPublished ?? true,
        seoTitle: seoTitle || null,
        seoDescription: seoDescription || null,
        lastEditedBy: session.user.id,
        lastEditedAt: new Date(),
      },
    })

    return NextResponse.json({ success: true, page })
  } catch (error) {
    console.error('CMS page create error:', error)
    return NextResponse.json({ error: 'Error creating page' }, { status: 500 })
  }
}
