import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/faq - Return active FAQs ordered by sortOrder (PUBLIC)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')

    const where: Record<string, unknown> = { isActive: true }
    if (category) where.category = category

    const faqs = await db.fAQ.findMany({
      where,
      orderBy: { sortOrder: 'asc' },
    })

    return NextResponse.json(faqs)
  } catch (error) {
    console.error('Error fetching FAQs:', error)
    return NextResponse.json({ error: 'Failed to fetch FAQs' }, { status: 500 })
  }
}
