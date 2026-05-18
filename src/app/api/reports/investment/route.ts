import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth } from '@/lib/api-auth'

export async function GET(request: NextRequest) {
  const { error, session } = await requireAuth(request.headers.get('cookie'))
  if (error) return error

  try {
    const userId = session!.user.id
    const { searchParams } = new URL(request.url)
    const investmentId = searchParams.get('investmentId')

    if (!investmentId) {
      return NextResponse.json({ error: 'investmentId is required' }, { status: 400 })
    }

    // Fetch investment with asset details
    const investment = await db.investment.findFirst({
      where: { id: investmentId, userId },
      include: {
        asset: {
          include: {
            cashFlowProjections: { orderBy: { period: 'asc' } },
            images: { where: { isCover: true }, take: 1 },
          },
        },
        transactions: { orderBy: { createdAt: 'desc' } },
        dividendPayments: { orderBy: { createdAt: 'desc' } },
      },
    })

    if (!investment) {
      return NextResponse.json({ error: 'Investment not found' }, { status: 404 })
    }

    // Calculate performance metrics
    const totalDividends = investment.dividendPayments
      .filter((d) => d.status === 'paid')
      .reduce((sum, d) => sum + d.amount, 0)

    const pendingDividends = investment.dividendPayments
      .filter((d) => d.status === 'pending')
      .reduce((sum, d) => sum + d.amount, 0)

    // ROI calculation
    const roi = investment.totalAmount > 0
      ? ((totalDividends - investment.totalAmount) / investment.totalAmount) * 100
      : 0

    // Current value estimation (based on projected appreciation)
    const asset = investment.asset
    const yearsHeld = Math.max(
      0,
      (Date.now() - new Date(investment.createdAt).getTime()) / (365.25 * 24 * 60 * 60 * 1000)
    )
    const currentEstimatedValue = investment.totalAmount * (1 + (asset.projectedAppreciation / 100) * yearsHeld)

    // Projected returns (annual yield)
    const annualProjectedDividend = investment.totalAmount * (asset.annualYield / 100)
    const monthlyProjectedDividend = annualProjectedDividend / 12

    // Total return including appreciation
    const totalProjectedReturn = investment.totalAmount * (asset.totalProjectedReturn / 100) * yearsHeld

    return NextResponse.json({
      // Investment details
      investment: {
        id: investment.id,
        quantity: investment.quantity,
        pricePerUnit: investment.pricePerUnit,
        totalAmount: investment.totalAmount,
        status: investment.status,
        completedAt: investment.completedAt,
        createdAt: investment.createdAt,
      },
      asset: {
        id: asset.id,
        name: asset.name,
        type: asset.type,
        status: asset.status,
        city: asset.city,
        country: asset.country,
        annualYield: asset.annualYield,
        projectedAppreciation: asset.projectedAppreciation,
        totalProjectedReturn: asset.totalProjectedReturn,
        pricePerFraction: asset.pricePerFraction,
        monthlyRent: asset.monthlyRent,
        leaseStatus: asset.leaseStatus,
        coverImage: asset.images[0]?.url || null,
      },
      // Payments history
      payments: {
        dividends: investment.dividendPayments.map((d) => ({
          id: d.id,
          amount: d.amount,
          perFraction: d.perFraction,
          fractions: d.fractions,
          periodStart: d.periodStart,
          periodEnd: d.periodEnd,
          paymentDate: d.paymentDate,
          status: d.status,
        })),
        transactions: investment.transactions.map((t) => ({
          id: t.id,
          type: t.type,
          amount: t.amount,
          currency: t.currency,
          status: t.status,
          description: t.description,
          createdAt: t.createdAt,
        })),
      },
      // Projected returns
      projected: {
        annualDividend: annualProjectedDividend,
        monthlyDividend: monthlyProjectedDividend,
        totalProjectedReturn,
        currentEstimatedValue,
        yearsHeld: Math.round(yearsHeld * 10) / 10,
      },
      // Performance metrics
      performance: {
        totalDividends,
        pendingDividends,
        roi: Math.round(roi * 100) / 100,
        currentValue: currentEstimatedValue,
        gainLoss: currentEstimatedValue + totalDividends - investment.totalAmount,
        gainLossPercent: investment.totalAmount > 0
          ? Math.round(((currentEstimatedValue + totalDividends - investment.totalAmount) / investment.totalAmount) * 10000) / 100
          : 0,
        dividendYield: investment.totalAmount > 0
          ? Math.round((totalDividends / investment.totalAmount) * 10000) / 100
          : 0,
      },
    })
  } catch (err) {
    console.error('Investment report error:', err)
    return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 })
  }
}
