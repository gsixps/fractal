import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/settings - Return all settings as a flat key-value map (PUBLIC)
export async function GET() {
  try {
    const settings = await db.siteSetting.findMany()

    const map: Record<string, string> = {}
    for (const setting of settings) {
      map[setting.key] = setting.value
    }

    return NextResponse.json(map)
  } catch (error) {
    console.error('Error fetching public settings:', error)
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 })
  }
}
