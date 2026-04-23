import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// PUT /api/admin/email-templates/[id] - Update email template
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    const existing = await db.emailTemplate.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Email template not found' }, { status: 404 })
    }

    const { name, subject, bodyHtml, bodyText, variables, category, isActive } = body

    const template = await db.emailTemplate.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(subject !== undefined && { subject }),
        ...(bodyHtml !== undefined && { bodyHtml }),
        ...(bodyText !== undefined && { bodyText }),
        ...(variables !== undefined && { variables }),
        ...(category !== undefined && { category }),
        ...(isActive !== undefined && { isActive }),
      },
    })

    return NextResponse.json(template)
  } catch (error) {
    console.error('Error updating email template:', error)
    return NextResponse.json({ error: 'Failed to update email template' }, { status: 500 })
  }
}

// DELETE /api/admin/email-templates/[id] - Delete email template
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const existing = await db.emailTemplate.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Email template not found' }, { status: 404 })
    }

    await db.emailTemplate.delete({ where: { id } })

    return NextResponse.json({ message: 'Email template deleted successfully' })
  } catch (error) {
    console.error('Error deleting email template:', error)
    return NextResponse.json({ error: 'Failed to delete email template' }, { status: 500 })
  }
}
