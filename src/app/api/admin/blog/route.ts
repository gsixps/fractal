import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/api-auth'

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

// GET /api/admin/blog - List blog posts with filters and pagination
export async function GET(request: Request) {
  const { error } = await requireAdmin(request.headers.get('cookie'))
  if (error) return error

  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '10', 10)))

    const where: Record<string, unknown> = {}

    if (status) where.status = status
    if (category) where.category = category
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { excerpt: { contains: search } },
      ]
    }

    const skip = (page - 1) * limit
    const total = await db.blogPost.count({ where })
    const posts = await db.blogPost.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      include: {
        author: {
          select: { id: true, name: true, email: true },
        },
      },
    })

    return NextResponse.json({
      posts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching blog posts:', error)
    return NextResponse.json({ error: 'Failed to fetch blog posts' }, { status: 500 })
  }
}

// POST /api/admin/blog - Create new blog post
export async function POST(request: Request) {
  const { error } = await requireAdmin(request.headers.get('cookie'))
  if (error) return error

  try {
    const body = await request.json()
    const { title, slug, excerpt, content, coverImage, category, tags, authorId, status, featured, readingTime, seoTitle, seoDescription } = body

    if (!title || !content) {
      return NextResponse.json({ error: 'title and content are required' }, { status: 400 })
    }

    const generatedSlug = slug || generateSlug(title)

    const post = await db.blogPost.create({
      data: {
        title,
        slug: generatedSlug,
        excerpt: excerpt || '',
        content,
        coverImage,
        category: category || 'educacion',
        tags: tags || '',
        authorId,
        status: status || 'draft',
        publishedAt: status === 'published' ? new Date() : null,
        featured: featured || false,
        readingTime: readingTime || null,
        seoTitle,
        seoDescription,
      },
      include: {
        author: {
          select: { id: true, name: true, email: true },
        },
      },
    })

    return NextResponse.json(post, { status: 201 })
  } catch (error) {
    console.error('Error creating blog post:', error)
    return NextResponse.json({ error: 'Failed to create blog post' }, { status: 500 })
  }
}
