import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/admin/investments — List all investments with user and asset info
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const userId = searchParams.get('userId');
    const assetId = searchParams.get('assetId');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    if (status) where.status = status;
    if (userId) where.userId = userId;
    if (assetId) where.assetId = assetId;

    const [investments, total] = await Promise.all([
      db.investment.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              rut: true,
              kycStatus: true,
            },
          },
          asset: {
            select: {
              id: true,
              name: true,
              type: true,
              status: true,
              pricePerFraction: true,
            },
          },
          transactions: {
            select: { id: true, type: true, amount: true, status: true },
          },
          dividendPayments: {
            select: { id: true, amount: true, status: true, paymentDate: true },
            orderBy: { createdAt: 'desc' },
          },
        },
      }),
      db.investment.count({ where }),
    ]);

    return NextResponse.json({
      investments,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error listing investments:', error);
    return NextResponse.json(
      { error: 'Failed to list investments' },
      { status: 500 }
    );
  }
}

// POST /api/admin/investments — Create investment
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate user exists
    const user = await db.user.findUnique({ where: { id: body.userId } });
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Validate asset exists
    const asset = await db.asset.findUnique({ where: { id: body.assetId } });
    if (!asset) {
      return NextResponse.json(
        { error: 'Asset not found' },
        { status: 404 }
      );
    }

    const quantity = body.quantity || 1;
    const pricePerUnit = body.pricePerUnit || asset.pricePerFraction;
    const totalAmount = body.totalAmount || pricePerUnit * quantity;

    // Check available fractions
    if (quantity > asset.availableFractions) {
      return NextResponse.json(
        { error: `Insufficient fractions available. Requested: ${quantity}, Available: ${asset.availableFractions}` },
        { status: 400 }
      );
    }

    // Create investment within a transaction
    const investment = await db.$transaction(async (tx) => {
      const newInvestment = await tx.investment.create({
        data: {
          userId: body.userId,
          assetId: body.assetId,
          quantity,
          pricePerUnit,
          totalAmount,
          status: body.status || 'pending',
          stripePaymentId: body.stripePaymentId || null,
          completedAt: body.status === 'completed' ? new Date() : null,
        },
        include: {
          user: { select: { id: true, name: true, email: true } },
          asset: { select: { id: true, name: true, type: true } },
        },
      });

      // If completed, update asset fractions and user stats
      if (body.status === 'completed') {
        await tx.asset.update({
          where: { id: body.assetId },
          data: {
            availableFractions: { decrement: quantity },
            fundedPercentage: Math.min(
              100,
              ((asset.totalFractions - asset.availableFractions + quantity) / asset.totalFractions) * 100
            ),
          },
        });

        await tx.user.update({
          where: { id: body.userId },
          data: {
            totalInvested: { increment: totalAmount },
            balance: { decrement: totalAmount },
          },
        });

        // Create a transaction record
        await tx.transaction.create({
          data: {
            userId: body.userId,
            investmentId: newInvestment.id,
            type: 'investment',
            amount: totalAmount,
            status: 'completed',
            description: `Inversión en ${asset.name} - ${quantity} fracciones`,
          },
        });
      }

      return newInvestment;
    });

    return NextResponse.json({ investment }, { status: 201 });
  } catch (error) {
    console.error('Error creating investment:', error);
    return NextResponse.json(
      { error: 'Failed to create investment' },
      { status: 500 }
    );
  }
}
