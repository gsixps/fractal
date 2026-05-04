import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const promotions = await db.promotion.findMany({
      where: { active: true },
      orderBy: { createdAt: 'desc' },
      take: 20,
    })
    return NextResponse.json(promotions)
  } catch {
    return NextResponse.json([])
  }
}
