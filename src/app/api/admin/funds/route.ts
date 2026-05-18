import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/auth-api'

export async function GET(request: Request) {
  const auth = await requireAdmin(request.headers.get('cookie'))
  if (!auth.authenticated) return NextResponse.json({ error: auth.error }, { status: auth.status })

  const funds = await db.fund.findMany({
    include: { _count: { select: { fundInvestments: true, holdings: true } } },
    orderBy: { totalAUM: 'desc' },
  })
  return NextResponse.json(funds)
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request.headers.get('cookie'))
  if (!auth.authenticated) return NextResponse.json({ error: auth.error }, { status: auth.status })

  const body = await request.json()
  const fund = await db.fund.create({ data: body })
  return NextResponse.json(fund, { status: 201 })
}
