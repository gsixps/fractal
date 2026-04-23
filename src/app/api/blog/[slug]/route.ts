import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/blog/[slug] - Return a single published blog post by slug (PUBLIC)
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    const post = await db.blogPost.findUnique({
      where: { slug },
      include: {
        author: {
          select: { id: true, name: true },
        },
      },
    })

    if (!post || post.status !== 'published') {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    // Increment views
    await db.blogPost.update({
      where: { id: post.id },
      data: { views: { increment: 1 } },
    })

    return NextResponse.json({ ...post, views: post.views + 1 })
  } catch (error) {
    console.error('Error fetching blog post:', error)
    return NextResponse.json({ error: 'Failed to fetch blog post' }, { status: 500 })
  }
}
