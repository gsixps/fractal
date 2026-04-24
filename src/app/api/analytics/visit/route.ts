import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { headers } from 'next/headers'

// POST /api/analytics/visit — Track a page visit (public)
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { page, path, referrer, userAgent, sessionId } = body

    if (!page || !path) {
      return NextResponse.json({ error: 'page and path are required' }, { status: 400 })
    }

    // Optional: rate limit by IP — skip for now, can add later
    const headersList = await headers()
    const ip = headersList.get('x-forwarded-for') || headersList.get('x-real-ip') || 'unknown'

    await db.pageVisit.create({
      data: {
        page: String(page).slice(0, 200),
        path: String(path).slice(0, 500),
        referrer: referrer ? String(referrer).slice(0, 500) : null,
        userAgent: userAgent ? String(userAgent).slice(0, 500) : null,
        sessionId: sessionId ? String(sessionId).slice(0, 100) : `ip-${ip}`,
      },
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Error tracking visit:', error)
    // Return 200 so tracking failures don't break the frontend
    return NextResponse.json({ ok: true })
  }
}
