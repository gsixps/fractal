import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const docs = await db.legalDocument.findMany({
      where: { active: true },
      orderBy: { updatedAt: 'desc' },
      take: 50,
    })
    return NextResponse.json(docs)
  } catch {
    return NextResponse.json([])
  }
}
