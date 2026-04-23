import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/api-auth'

// GET /api/admin/settings - Return all settings grouped by group
export async function GET() {
  const { error } = await requireAdmin()
  if (error) return error

  try {
    const settings = await db.siteSetting.findMany({
      orderBy: { group: 'asc' },
    })

    const grouped = settings.reduce(
      (acc, setting) => {
        if (!acc[setting.group]) {
          acc[setting.group] = []
        }
        acc[setting.group].push(setting)
        return acc
      },
      {} as Record<string, typeof settings>
    )

    return NextResponse.json(grouped)
  } catch (error) {
    console.error('Error fetching settings:', error)
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 })
  }
}

// PUT /api/admin/settings - Bulk update settings
export async function PUT(request: NextRequest) {
  const { error } = await requireAdmin()
  if (error) return error

  try {
    const body = await request.json()
    const { settings } = body as { settings: Array<{ key: string; value: string }> }

    if (!settings || !Array.isArray(settings)) {
      return NextResponse.json({ error: 'settings array is required' }, { status: 400 })
    }

    for (const item of settings) {
      if (!item.key) continue

      // Update if exists, only create if not (with minimal required fields)
      const existing = await db.siteSetting.findUnique({
        where: { key: item.key },
      })

      if (existing) {
        await db.siteSetting.update({
          where: { key: item.key },
          data: { value: item.value },
        })
      } else {
        await db.siteSetting.create({
          data: {
            key: item.key,
            value: item.value,
            label: item.key,
          },
        })
      }
    }

    return NextResponse.json({ message: 'Settings updated successfully' })
  } catch (error) {
    console.error('Error updating settings:', error)
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 })
  }
}
