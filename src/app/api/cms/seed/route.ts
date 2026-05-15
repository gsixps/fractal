import { NextResponse } from 'next/server'
import { seedCmsPages } from '@/lib/seed-cms-pages'

// GET /api/cms/seed — Seed default CMS pages (called internally)
export async function GET() {
  try {
    const results = await seedCmsPages()
    return NextResponse.json({ success: true, results })
  } catch (error) {
    console.error('CMS seed error:', error)
    return NextResponse.json({ error: 'Seed failed' }, { status: 500 })
  }
}
