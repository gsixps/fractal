import { db } from '@/lib/db'

/**
 * Calculate NAV for all active funds
 * Should be called daily (via cron or manual trigger)
 */
export async function calculateAllNAVs() {
  const funds = await db.fund.findMany({
    where: { status: 'active' },
    include: { holdings: { include: { asset: true } } },
  })

  const results = []

  for (const fund of funds) {
    try {
      const result = await calculateFundNAV(fund.id)
      results.push(result)
    } catch (err) {
      results.push({
        fundId: fund.id,
        fundName: fund.name,
        error: err instanceof Error ? err.message : 'Unknown error',
      })
    }
  }

  return results
}

/**
 * Calculate NAV for a single fund
 */
export async function calculateFundNAV(fundId: string) {
  const fund = await db.fund.findUnique({
    where: { id: fundId },
    include: { holdings: { include: { asset: true } } },
  })

  if (!fund) throw new Error(`Fund ${fundId} not found`)

  let totalAUM = 0
  const holdingResults = []

  for (const holding of fund.holdings) {
    const assetCurrentPrice = holding.asset.pricePerFraction
    const currentValue = assetCurrentPrice * holding.fractionCount
    const unrealizedPL = currentValue - holding.totalCostBasis

    // Update holding
    await db.fundHolding.update({
      where: { id: holding.id },
      data: {
        valueUsd: currentValue,
        unrealizedPL,
        currentWeightPct: 0, // Will recalculate below
      },
    })

    totalAUM += currentValue
    holdingResults.push({
      assetId: holding.assetId,
      assetName: holding.asset.name,
      currentValue,
      unrealizedPL,
    })
  }

  // Recalculate weight percentages
  if (totalAUM > 0) {
    for (const holding of fund.holdings) {
      await db.fundHolding.update({
        where: { id: holding.id },
        data: {
          currentWeightPct: Math.round((holding.valueUsd / totalAUM) * 10000) / 100,
        },
      })
    }
  }

  const outstandingShares = fund.totalShares - fund.availableShares
  const navPerShare = outstandingShares > 0
    ? Math.round((totalAUM / outstandingShares) * 100) / 100
    : fund.navPerShare

  // Deduct daily expense ratio
  let adjustedNAV = navPerShare
  if (fund.expenseRatio) {
    const dailyFee = navPerShare * (fund.expenseRatio / 100) / 365
    adjustedNAV = Math.round((navPerShare - dailyFee) * 100) / 100
  }

  // Update fund
  await db.fund.update({
    where: { id: fundId },
    data: {
      totalAUM,
      navPerShare: Math.max(adjustedNAV, 0.01),
      pricePerShare: Math.max(adjustedNAV, 0.01),
    },
  })

  // Save NAV history
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  try {
    await db.nAVHistory.create({
      data: {
        fundId,
        navPerShare: Math.max(adjustedNAV, 0.01),
        totalAUM,
        totalShares: fund.totalShares,
        date: today,
      },
    })
  } catch {
    // Already exists for today — update instead
    const existing = await db.nAVHistory.findFirst({
      where: { fundId, date: today },
    })
    if (existing) {
      await db.nAVHistory.update({
        where: { id: existing.id },
        data: {
          navPerShare: Math.max(adjustedNAV, 0.01),
          totalAUM,
        },
      })
    }
  }

  return {
    fundId,
    fundName: fund.name,
    navPerShare: Math.max(adjustedNAV, 0.01),
    totalAUM,
    outstandingShares,
    holdings: holdingResults,
  }
}

/**
 * Distribute dividends to all fund investors
 * Called quarterly/monthly based on fund.dividendFrequency
 */
export async function distributeDividends(fundId: string) {
  const fund = await db.fund.findUnique({
    where: { id: fundId },
    include: {
      holdings: { include: { asset: true } },
      fundInvestments: {
        where: { status: 'active' },
        include: { user: true },
      },
    },
  })

  if (!fund) throw new Error(`Fund ${fundId} not found`)

  // Calculate total dividend pool from underlying assets
  // Using asset annualYield as proxy for annual dividend
  let totalAnnualDividends = 0
  for (const holding of fund.holdings) {
    const assetAnnualDividend = holding.asset.pricePerFraction * holding.fractionCount * (holding.asset.annualYield / 100)
    totalAnnualDividends += assetAnnualDividend
  }

  // Period fraction (quarterly = 0.25, monthly = 1/12)
  const periodFraction = fund.dividendFrequency === 'monthly' ? 1 / 12 : 1 / 4
  const totalPeriodDividends = totalAnnualDividends * periodFraction

  const outstandingShares = fund.totalShares - fund.availableShares
  const dividendPerShare = outstandingShares > 0
    ? Math.round((totalPeriodDividends / outstandingShares) * 100) / 100
    : 0

  if (dividendPerShare <= 0) return { message: 'No dividends to distribute', fundName: fund.name }

  // Set period dates
  const now = new Date()
  const periodEnd = new Date(now)
  const periodStart = new Date(now)

  if (fund.dividendFrequency === 'monthly') {
    periodStart.setMonth(periodStart.getMonth() - 1)
  } else {
    periodStart.setMonth(periodStart.getMonth() - 3)
  }

  const results = []

  // Distribute to each investor
  for (const investment of fund.fundInvestments) {
    const amount = Math.round(investment.shares * dividendPerShare * 100) / 100

    if (amount <= 0) continue

    // Create dividend payment record
    const dividend = await db.fundDividendPayment.create({
      data: {
        userId: investment.userId,
        fundInvestmentId: investment.id,
        fundId,
        sharesHeld: investment.shares,
        dividendPerShare,
        totalAmount: amount,
        periodStart,
        periodEnd,
        status: 'pending',
      },
    })

    // Credit user balance and earnings
    await db.user.update({
      where: { id: investment.userId },
      data: {
        balance: { increment: amount },
        totalEarnings: { increment: amount },
      },
    })

    // Mark as paid
    await db.fundDividendPayment.update({
      where: { id: dividend.id },
      data: { paymentDate: now, status: 'paid' },
    })

    // Create transaction record
    await db.transaction.create({
      data: {
        userId: investment.userId,
        type: 'payout',
        amount,
        currency: 'USD',
        status: 'completed',
        description: `Dividend from ${fund.name}: ${investment.shares} shares @ $${dividendPerShare}/share`,
      },
    })

    // Audit log
    await db.auditLog.create({
      data: {
        action: 'fund.dividend',
        entity: 'FundDividendPayment',
        entityId: dividend.id,
        details: `Distributed $${amount} dividend for ${fund.name} to user ${investment.userId}`,
      },
    })

    results.push({ userId: investment.userId, amount, shares: investment.shares })
  }

  // Update fund dividend yield
  const annualizedYield = outstandingShares > 0
    ? Math.round((totalAnnualDividends / (fund.navPerShare * outstandingShares)) * 10000) / 100
    : 0

  await db.fund.update({
    where: { id: fundId },
    data: { dividendYield: annualizedYield },
  })

  return {
    fundName: fund.name,
    dividendPerShare,
    totalDistributed: results.reduce((sum, r) => sum + r.amount, 0),
    investorCount: results.length,
    periodStart,
    periodEnd,
    investors: results,
  }
}

/**
 * Check if rebalancing is needed and execute
 */
export async function checkRebalance(fundId: string) {
  const fund = await db.fund.findUnique({
    where: { id: fundId },
    include: { holdings: { include: { asset: true } } },
  })

  if (!fund) throw new Error(`Fund ${fundId} not found`)

  const threshold = 5 // 5% drift threshold
  const needsRebalance = fund.holdings.some(
    (h) => Math.abs(h.currentWeightPct - h.targetWeightPct) > threshold
  )

  if (!needsRebalance) {
    return { needsRebalance: false, fundName: fund.name, message: 'Weights within acceptable range' }
  }

  // Log the rebalance recommendation
  const previousWeights = fund.holdings.reduce((acc, h) => {
    acc[h.assetId] = h.currentWeightPct
    return acc
  }, {} as Record<string, number>)

  const newWeights = fund.holdings.reduce((acc, h) => {
    acc[h.assetId] = h.targetWeightPct
    return acc
  }, {} as Record<string, number>)

  await db.rebalanceLog.create({
    data: {
      fundId,
      reason: 'drift',
      previousWeights: JSON.stringify(previousWeights),
      newWeights: JSON.stringify(newWeights),
      executedBy: 'system',
    },
  })

  return {
    needsRebalance: true,
    fundName: fund.name,
    previousWeights,
    newWeights,
    holdings: fund.holdings.map(h => ({
      asset: h.asset.name,
      target: h.targetWeightPct,
      current: h.currentWeightPct,
      drift: Math.abs(h.currentWeightPct - h.targetWeightPct),
    })),
  }
}
