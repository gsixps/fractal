import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// GET /api/admin/translations/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || !['superadmin', 'admin'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const translation = await db.translation.findUnique({
      where: { id },
    })

    if (!translation) {
      return NextResponse.json({ error: 'Translation not found' }, { status: 404 })
    }

    return NextResponse.json(translation)
  } catch (error) {
    console.error('GET /api/admin/translations/[id] error:', error)
    return NextResponse.json({ error: 'Failed to fetch translation' }, { status: 500 })
  }
}

// PUT /api/admin/translations/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || !['superadmin', 'admin'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { value } = body

    if (value === undefined) {
      return NextResponse.json({ error: 'value is required' }, { status: 400 })
    }

    const translation = await db.translation.update({
      where: { id },
      data: { value },
    })

    return NextResponse.json(translation)
  } catch (error) {
    console.error('PUT /api/admin/translations/[id] error:', error)
    return NextResponse.json({ error: 'Failed to update translation' }, { status: 500 })
  }
}

// DELETE /api/admin/translations/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || !['superadmin', 'admin'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    await db.translation.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Translation deleted' })
  } catch (error) {
    console.error('DELETE /api/admin/translations/[id] error:', error)
    return NextResponse.json({ error: 'Failed to delete translation' }, { status: 500 })
  }
}
