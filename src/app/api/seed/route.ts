import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { seedDatabase } from '@/lib/seed'
import { requireAdmin } from '@/lib/api-auth'

export async function POST(request: NextRequest) {
  // SECURITY: Only admin/superadmin can seed the database
  const { error } = await requireAdmin()
  if (error) return error

  try {
    const { searchParams } = new URL(request.url)
    const force = searchParams.get('force') === 'true'

    const result = await seedDatabase({ force })
    return NextResponse.json(result)
  } catch (error) {
    console.error('Seed error:', error)
    return NextResponse.json({ error: 'Seed failed' }, { status: 500 })
  }
}
