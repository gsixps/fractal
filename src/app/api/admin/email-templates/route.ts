import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/api-auth'

// GET /api/admin/email-templates - List all email templates
export async function GET() {
  const { error } = await requireAdmin()
  if (error) return error

  try {
    const templates = await db.emailTemplate.findMany({
      orderBy: { name: 'asc' },
    })

    return NextResponse.json(templates)
  } catch (error) {
    console.error('Error fetching email templates:', error)
    return NextResponse.json({ error: 'Failed to fetch email templates' }, { status: 500 })
  }
}

// POST /api/admin/email-templates - Create new email template
export async function POST(request: Request) {
  const { error } = await requireAdmin()
  if (error) return error

  try {
    const body = await request.json()
    const { name, subject, bodyHtml, bodyText, variables, category, isActive } = body

    if (!name || !subject || !bodyHtml) {
      return NextResponse.json({ error: 'name, subject, and bodyHtml are required' }, { status: 400 })
    }

    const template = await db.emailTemplate.create({
      data: {
        name,
        subject,
        bodyHtml,
        bodyText: bodyText || '',
        variables: variables || '[]',
        category: category || 'transactional',
        isActive: isActive ?? true,
      },
    })

    return NextResponse.json(template, { status: 201 })
  } catch (error) {
    console.error('Error creating email template:', error)
    return NextResponse.json({ error: 'Failed to create email template' }, { status: 500 })
  }
}
