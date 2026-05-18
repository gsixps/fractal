import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/api-auth'

// GET /api/admin/translations — admin only, return all translations with optional filters
// ?locale=es&search=key_prefix
export async function GET(request: NextRequest) {
  try {
    const { error } = await requireAdmin(request.headers.get('cookie'))
    if (error) return error

    const { searchParams } = new URL(request.url)
    const locale = searchParams.get('locale') || undefined
    const search = searchParams.get('search') || undefined

    const translations = await db.translation.findMany({
      where: {
        ...(locale && { locale }),
        ...(search && { key: { startsWith: search } }),
      },
      orderBy: [{ locale: 'asc' }, { key: 'asc' }],
    })

    return NextResponse.json(translations)
  } catch (error) {
    console.error('GET /api/admin/translations error:', error)
    return NextResponse.json({ error: 'Failed to fetch translations' }, { status: 500 })
  }
}

// POST /api/admin/translations — admin only, create or update a translation (upsert by key+locale)
export async function POST(request: NextRequest) {
  try {
    const { error: authErr } = await requireAdmin(request.headers.get('cookie'))
    if (authErr) return authErr

    const body = await request.json()
    const { key, locale, value } = body

    if (!key || !locale || value === undefined) {
      return NextResponse.json({ error: 'key, locale, and value are required' }, { status: 400 })
    }

    const translation = await db.translation.upsert({
      where: {
        key_locale: { key, locale },
      },
      update: { value },
      create: { key, locale, value },
    })

    return NextResponse.json(translation)
  } catch (error) {
    console.error('POST /api/admin/translations error:', error)
    return NextResponse.json({ error: 'Failed to upsert translation' }, { status: 500 })
  }
}
