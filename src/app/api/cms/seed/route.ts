import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/api-auth'
import { seedCmsPages } from '@/lib/seed-cms-pages'

// GET /api/cms/seed — Seed default CMS pages (admin only)
export async function GET(request: Request) {
  const { error } = await requireAdmin(request.headers.get('cookie'))
  if (error) return error

  try {
    const results = await seedCmsPages()
    return NextResponse.json({ success: true, results })
  } catch (error) {
    console.error('CMS seed error:', error)
    return NextResponse.json({ error: 'Seed failed' }, { status: 500 })
  }
}
