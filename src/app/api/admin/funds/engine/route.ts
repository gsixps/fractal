import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth-api'
import { calculateAllNAVs, distributeDividends, checkRebalance } from '@/lib/fund-engine'

export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request)
  if (!auth.authenticated) return NextResponse.json({ error: auth.error }, { status: auth.status })

  const body = await request.json()
  const { action, fundId } = body

  switch (action) {
    case 'calculate-nav': {
      const navResults = await calculateAllNAVs()
      return NextResponse.json({ success: true, results: navResults })
    }

    case 'distribute-dividends': {
      if (!fundId) return NextResponse.json({ error: 'fundId is required' }, { status: 400 })
      const divResult = await distributeDividends(fundId)
      return NextResponse.json({ success: true, ...divResult })
    }

    case 'check-rebalance': {
      if (!fundId) return NextResponse.json({ error: 'fundId is required' }, { status: 400 })
      const rebResult = await checkRebalance(fundId)
      return NextResponse.json({ success: true, ...rebResult })
    }

    default:
      return NextResponse.json(
        { error: 'Invalid action. Use: calculate-nav, distribute-dividends, check-rebalance' },
        { status: 400 }
      )
  }
}
