import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/api-auth'

// PUT /api/admin/legal/[id] - Update legal document
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdmin()
  if (error) return error

  try {
    const { id } = await params
    const body = await request.json()

    const existing = await db.legalDocument.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Legal document not found' }, { status: 404 })
    }

    const { title, slug, content, version, effectiveDate, type, isRequired, isActive } = body

    const document = await db.legalDocument.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(slug !== undefined && { slug }),
        ...(content !== undefined && { content }),
        ...(version !== undefined && { version }),
        ...(effectiveDate !== undefined && { effectiveDate: new Date(effectiveDate) }),
        ...(type !== undefined && { type }),
        ...(isRequired !== undefined && { isRequired }),
        ...(isActive !== undefined && { isActive }),
      },
    })

    return NextResponse.json(document)
  } catch (error) {
    console.error('Error updating legal document:', error)
    return NextResponse.json({ error: 'Failed to update legal document' }, { status: 500 })
  }
}

// DELETE /api/admin/legal/[id] - Delete legal document
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdmin()
  if (error) return error

  try {
    const { id } = await params

    const existing = await db.legalDocument.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Legal document not found' }, { status: 404 })
    }

    await db.legalDocument.delete({ where: { id } })

    return NextResponse.json({ message: 'Legal document deleted successfully' })
  } catch (error) {
    console.error('Error deleting legal document:', error)
    return NextResponse.json({ error: 'Failed to delete legal document' }, { status: 500 })
  }
}
