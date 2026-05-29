import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: Request) {
  try {
    const limit = parseInt(new URL(request.url).searchParams.get('limit') || '20')
    const testimonials = await db.testimonial.findMany({
      where: { status: 'approved' },
      orderBy: { sortOrder: 'asc' },
      take: limit,
    })
    return NextResponse.json(testimonials)
  } catch {
    return NextResponse.json([])
  }
}
