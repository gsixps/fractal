import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/auth-api'

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin(request)
  if (!auth.authenticated) return NextResponse.json({ error: auth.error }, { status: auth.status })
  
  const { id } = await params
  const fund = await db.fund.findUnique({
    where: { id },
    include: { holdings: { include: { asset: true } }, navHistory: { orderBy: { date: 'desc' }, take: 30 } },
  })
  if (!fund) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(fund)
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin(request)
  if (!auth.authenticated) return NextResponse.json({ error: auth.error }, { status: auth.status })

  const { id } = await params
  const body = await request.json()
  const fund = await db.fund.update({ where: { id }, data: body })
  return NextResponse.json(fund)
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin(request)
  if (!auth.authenticated) return NextResponse.json({ error: auth.error }, { status: auth.status })

  const { id } = await params
  await db.fund.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
