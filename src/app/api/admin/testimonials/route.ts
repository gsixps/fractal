import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/api-auth'

// GET /api/admin/testimonials - List all testimonials
export async function GET(request: Request) {
  const { error } = await requireAdmin(request.headers.get('cookie'))
  if (error) return error

  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    const where: Record<string, unknown> = {}
    if (status) where.status = status

    const testimonials = await db.testimonial.findMany({
      where,
      orderBy: { sortOrder: 'asc' },
    })

    return NextResponse.json(testimonials)
  } catch (error) {
    console.error('Error fetching testimonials:', error)
    return NextResponse.json({ error: 'Failed to fetch testimonials' }, { status: 500 })
  }
}

// POST /api/admin/testimonials - Create new testimonial
export async function POST(request: Request) {
  const { error } = await requireAdmin(request.headers.get('cookie'))
  if (error) return error

  try {
    const body = await request.json()
    const { name, role, avatarUrl, quote, rating, investmentAmount, assetName, isFeatured, isVerified, sortOrder, status } = body

    if (!name || !quote) {
      return NextResponse.json({ error: 'name and quote are required' }, { status: 400 })
    }

    const testimonial = await db.testimonial.create({
      data: {
        name,
        role,
        avatarUrl,
        quote,
        rating: rating ?? 5,
        investmentAmount,
        assetName,
        isFeatured: isFeatured ?? false,
        isVerified: isVerified ?? true,
        sortOrder: sortOrder ?? 0,
        status: status || 'pending',
      },
    })

    return NextResponse.json(testimonial, { status: 201 })
  } catch (error) {
    console.error('Error creating testimonial:', error)
    return NextResponse.json({ error: 'Failed to create testimonial' }, { status: 500 })
  }
}
