import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const testimonials = await db.testimonial.findMany({
      where: { active: true, status: 'approved' },
      orderBy: { sortOrder: 'asc' },
      take: 20,
    })
    return NextResponse.json(testimonials)
  } catch {
    return NextResponse.json([])
  }
}
