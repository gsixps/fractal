import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const members = await db.teamMember.findMany({
      where: { active: true },
      orderBy: { sortOrder: 'asc' },
      take: 20,
    })
    return NextResponse.json(members)
  } catch {
    return NextResponse.json([])
  }
}
