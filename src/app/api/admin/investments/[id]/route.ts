import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/admin/investments/:id — Get single investment
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const investment = await db.investment.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            rut: true,
            kycStatus: true,
            avatarUrl: true,
          },
        },
        asset: {
          include: {
            images: { where: { isCover: true }, take: 1 },
          },
        },
        transactions: {
          orderBy: { createdAt: 'desc' },
        },
        dividendPayments: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!investment) {
      return NextResponse.json(
        { error: 'Investment not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ investment });
  } catch (error) {
    console.error('Error fetching investment:', error);
    return NextResponse.json(
      { error: 'Failed to fetch investment' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/investments/:id — Update investment status
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const existing = await db.investment.findUnique({
      where: { id },
      include: { asset: true, user: true },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Investment not found' },
        { status: 404 }
      );
    }

    // Handle status transitions
    const oldStatus = existing.status;
    const newStatus = body.status;

    if (newStatus && newStatus !== oldStatus) {
      // Completing an investment
      if (newStatus === 'completed' && oldStatus === 'pending') {
        // Check available fractions
        if (existing.quantity > existing.asset.availableFractions) {
          return NextResponse.json(
            { error: 'Insufficient fractions available' },
            { status: 400 }
          );
        }

        const updatedInvestment = await db.$transaction(async (tx) => {
          const inv = await tx.investment.update({
            where: { id },
            data: {
              status: 'completed',
              completedAt: new Date(),
            },
            include: {
              user: { select: { id: true, name: true, email: true } },
              asset: { select: { id: true, name: true, type: true } },
            },
          });

          // Update asset fractions
          await tx.asset.update({
            where: { id: existing.assetId },
            data: {
              availableFractions: { decrement: existing.quantity },
              fundedPercentage: Math.min(
                100,
                ((existing.asset.totalFractions - existing.asset.availableFractions + existing.quantity) /
                  existing.asset.totalFractions) *
                  100
              ),
            },
          });

          // Update user stats
          await tx.user.update({
            where: { id: existing.userId },
            data: {
              totalInvested: { increment: existing.totalAmount },
              balance: { decrement: existing.totalAmount },
            },
          });

          // Create transaction record
          await tx.transaction.create({
            data: {
              userId: existing.userId,
              investmentId: id,
              type: 'investment',
              amount: existing.totalAmount,
              status: 'completed',
              description: `Inversión en ${existing.asset.name} - ${existing.quantity} fracciones`,
            },
          });

          return inv;
        });

        return NextResponse.json({ investment: updatedInvestment });
      }

      // Cancelling an investment
      if (newStatus === 'cancelled' && oldStatus === 'completed') {
        const updatedInvestment = await db.$transaction(async (tx) => {
          const inv = await tx.investment.update({
            where: { id },
            data: { status: 'cancelled' },
            include: {
              user: { select: { id: true, name: true, email: true } },
              asset: { select: { id: true, name: true, type: true } },
            },
          });

          // Return fractions to asset
          await tx.asset.update({
            where: { id: existing.assetId },
            data: {
              availableFractions: { increment: existing.quantity },
            },
          });

          // Refund user
          await tx.user.update({
            where: { id: existing.userId },
            data: {
              totalInvested: { decrement: existing.totalAmount },
              balance: { increment: existing.totalAmount },
            },
          });

          // Create refund transaction
          await tx.transaction.create({
            data: {
              userId: existing.userId,
              investmentId: id,
              type: 'refund',
              amount: existing.totalAmount,
              status: 'completed',
              description: `Reembolso por cancelación - ${existing.asset.name}`,
            },
          });

          return inv;
        });

        return NextResponse.json({ investment: updatedInvestment });
      }

      // Simple status change (no side effects)
      const investment = await db.investment.update({
        where: { id },
        data: { status: newStatus },
        include: {
          user: { select: { id: true, name: true, email: true } },
          asset: { select: { id: true, name: true, type: true } },
        },
      });

      return NextResponse.json({ investment });
    }

    // Update other fields if no status change
    const updateData: Record<string, unknown> = {};
    if (body.quantity !== undefined) updateData.quantity = body.quantity;
    if (body.pricePerUnit !== undefined) updateData.pricePerUnit = body.pricePerUnit;
    if (body.totalAmount !== undefined) updateData.totalAmount = body.totalAmount;
    if (body.stripePaymentId !== undefined) updateData.stripePaymentId = body.stripePaymentId;

    if (Object.keys(updateData).length > 0) {
      const investment = await db.investment.update({
        where: { id },
        data: updateData,
        include: {
          user: { select: { id: true, name: true, email: true } },
          asset: { select: { id: true, name: true, type: true } },
        },
      });

      return NextResponse.json({ investment });
    }

    // No changes
    return NextResponse.json({ investment: existing });
  } catch (error) {
    console.error('Error updating investment:', error);
    return NextResponse.json(
      { error: 'Failed to update investment' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/investments/:id — Delete investment
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const existing = await db.investment.findUnique({
      where: { id },
      include: { asset: true, user: true },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Investment not found' },
        { status: 404 }
      );
    }

    // Only allow deleting pending investments
    if (existing.status === 'completed' || existing.status === 'active') {
      return NextResponse.json(
        { error: 'Cannot delete a completed or active investment. Cancel it first.' },
        { status: 400 }
      );
    }

    await db.investment.delete({ where: { id } });

    return NextResponse.json({ message: 'Investment deleted successfully' });
  } catch (error) {
    console.error('Error deleting investment:', error);
    return NextResponse.json(
      { error: 'Failed to delete investment' },
      { status: 500 }
    );
  }
}
