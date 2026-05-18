import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/api-auth'

// GET /api/admin/faq - List all FAQs with categories
export async function GET(request: Request) {
  const { error } = await requireAdmin(request.headers.get('cookie'))
  if (error) return error

  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')

    const where: Record<string, unknown> = {}
    if (category) where.category = category

    const faqs = await db.fAQ.findMany({
      where,
      orderBy: { sortOrder: 'asc' },
    })

    const categoriesResult = await db.fAQ.findMany({
      select: { category: true },
      distinct: ['category'],
    })

    const categories = categoriesResult.map((c) => c.category)

    return NextResponse.json({ faqs, categories })
  } catch (error) {
    console.error('Error fetching FAQs:', error)
    return NextResponse.json({ error: 'Failed to fetch FAQs' }, { status: 500 })
  }
}

// POST /api/admin/faq - Create new FAQ
export async function POST(request: Request) {
  const { error } = await requireAdmin(request.headers.get('cookie'))
  if (error) return error

  try {
    const body = await request.json()
    const { question, answer, category, sortOrder, isActive } = body

    if (!question || !answer) {
      return NextResponse.json({ error: 'question and answer are required' }, { status: 400 })
    }

    const faq = await db.fAQ.create({
      data: {
        question,
        answer,
        category: category || 'inversion',
        sortOrder: sortOrder ?? 0,
        isActive: isActive ?? true,
      },
    })

    return NextResponse.json(faq, { status: 201 })
  } catch (error) {
    console.error('Error creating FAQ:', error)
    return NextResponse.json({ error: 'Failed to create FAQ' }, { status: 500 })
  }
}
