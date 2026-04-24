import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/translations — public endpoint
// Returns translations for a given locale as a flat object { key: value }
// ?locale=es (default es)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const locale = searchParams.get('locale') || 'es'

    const rows = await db.translation.findMany({
      where: { locale },
      select: { key: true, value: true },
    })

    // Flatten to a simple { key: value } object
    const flat: Record<string, string> = {}
    for (const row of rows) {
      flat[row.key] = row.value
    }

    return NextResponse.json(flat)
  } catch (error) {
    console.error('GET /api/translations error:', error)
    return NextResponse.json({ error: 'Failed to fetch translations' }, { status: 500 })
  }
}
