import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/api-auth';

// GET /api/admin/liquidity — Get liquidity pool data with active requests
export async function GET(request: NextRequest) {
  const { error } = await requireAdmin(request.headers.get('cookie'));
  if (error) return error;

  try {
    const pool = await db.liquidityPool.findFirst({
      include: {
        requests: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                rut: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!pool) {
      // Create default pool if none exists
      const newPool = await db.liquidityPool.create({
        data: {
          totalReserve: 0,
          totalAssets: 0,
          activeRequests: 0,
          utilizationRate: 0,
          autoReplenish: true,
        },
      });

      return NextResponse.json({
        pool: {
          ...newPool,
          requests: [],
          activeRequestsList: [],
        },
      });
    }

    // Separate active and all requests
    const allRequests = pool.requests;
    const activeRequestsList = allRequests.filter(
      (r) => r.status === 'pending' || r.status === 'processing'
    );
    const completedRequests = allRequests.filter((r) => r.status === 'completed');
    const rejectedRequests = allRequests.filter((r) => r.status === 'rejected');

    // Calculate summary stats
    const totalRequestedAmount = activeRequestsList.reduce(
      (sum, r) => sum + r.totalAmount,
      0
    );
    const totalCompletedAmount = completedRequests.reduce(
      (sum, r) => sum + (r.netAmount || r.totalAmount),
      0
    );
    const totalFeesCollected = completedRequests.reduce(
      (sum, r) => sum + r.expressFee,
      0
    );

    return NextResponse.json({
      pool: {
        id: pool.id,
        totalReserve: pool.totalReserve,
        totalAssets: pool.totalAssets,
        activeRequests: activeRequestsList.length,
        utilizationRate: pool.utilizationRate,
        monthlyContribution: pool.monthlyContribution,
        autoReplenish: pool.autoReplenish,
        createdAt: pool.createdAt,
        updatedAt: pool.updatedAt,
      },
      stats: {
        totalRequestedAmount,
        totalCompletedAmount,
        totalFeesCollected,
        pendingCount: allRequests.filter((r) => r.status === 'pending').length,
        processingCount: allRequests.filter((r) => r.status === 'processing').length,
        completedCount: completedRequests.length,
        rejectedCount: rejectedRequests.length,
      },
      activeRequests: activeRequestsList,
      recentRequests: allRequests.slice(0, 20),
    });
  } catch (error) {
    console.error('Error fetching liquidity data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch liquidity data' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/liquidity — Update liquidity pool settings
export async function PUT(request: NextRequest) {
  const { error } = await requireAdmin(request.headers.get('cookie'));
  if (error) return error;

  try {
    const body = await request.json();

    let pool = await db.liquidityPool.findFirst();

    if (!pool) {
      // Create if doesn't exist
      pool = await db.liquidityPool.create({
        data: {
          totalReserve: body.totalReserve ?? 0,
          totalAssets: body.totalAssets ?? 0,
          activeRequests: body.activeRequests ?? 0,
          utilizationRate: body.utilizationRate ?? 0,
          monthlyContribution: body.monthlyContribution ?? null,
          autoReplenish: body.autoReplenish ?? true,
        },
      });
    } else {
      // Recalculate active requests count if not explicitly set
      const activeRequestsCount = await db.liquidityRequest.count({
        where: {
          poolId: pool.id,
          status: { in: ['pending', 'processing'] },
        },
      });

      pool = await db.liquidityPool.update({
        where: { id: pool.id },
        data: {
          ...(body.totalReserve !== undefined && { totalReserve: body.totalReserve }),
          ...(body.totalAssets !== undefined && { totalAssets: body.totalAssets }),
          activeRequests: body.activeRequests ?? activeRequestsCount,
          ...(body.utilizationRate !== undefined && { utilizationRate: body.utilizationRate }),
          ...(body.monthlyContribution !== undefined && { monthlyContribution: body.monthlyContribution }),
          ...(body.autoReplenish !== undefined && { autoReplenish: body.autoReplenish }),
        },
      });
    }

    return NextResponse.json({ pool });
  } catch (error) {
    console.error('Error updating liquidity pool:', error);
    return NextResponse.json(
      { error: 'Failed to update liquidity pool' },
      { status: 500 }
    );
  }
}
