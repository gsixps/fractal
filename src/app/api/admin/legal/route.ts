import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/api-auth'

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

// GET /api/admin/legal - List all legal documents
export async function GET() {
  const { error } = await requireAdmin()
  if (error) return error

  try {
    const documents = await db.legalDocument.findMany({
      orderBy: { type: 'asc' },
    })

    return NextResponse.json(documents)
  } catch (error) {
    console.error('Error fetching legal documents:', error)
    return NextResponse.json({ error: 'Failed to fetch legal documents' }, { status: 500 })
  }
}

// POST /api/admin/legal - Create new legal document
export async function POST(request: Request) {
  const { error } = await requireAdmin()
  if (error) return error

  try {
    const body = await request.json()
    const { title, slug, content, version, effectiveDate, type, isRequired, isActive } = body

    if (!title || !content || !effectiveDate) {
      return NextResponse.json({ error: 'title, content, and effectiveDate are required' }, { status: 400 })
    }

    const generatedSlug = slug || generateSlug(title)

    const document = await db.legalDocument.create({
      data: {
        title,
        slug: generatedSlug,
        content,
        version: version || '1.0',
        effectiveDate: new Date(effectiveDate),
        type: type || 'terms',
        isRequired: isRequired ?? false,
        isActive: isActive ?? true,
      },
    })

    return NextResponse.json(document, { status: 201 })
  } catch (error) {
    console.error('Error creating legal document:', error)
    return NextResponse.json({ error: 'Failed to create legal document' }, { status: 500 })
  }
}
