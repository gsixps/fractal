import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/admin/users/:id — Get single user with investments and transactions count
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const user = await db.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        passwordHash: true,
        name: true,
        phone: true,
        rut: true,
        role: true,
        kycStatus: true,
        kycSubmittedAt: true,
        kycVerifiedAt: true,
        avatarUrl: true,
        stripeCustomerId: true,
        balance: true,
        totalInvested: true,
        totalEarnings: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            investments: true,
            transactions: true,
            dividendPayments: true,
            kycDocuments: true,
            notifications: true,
            liquidityRequests: true,
          },
        },
        investments: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: {
            asset: { select: { id: true, name: true, type: true } },
          },
        },
        kycDocuments: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/users/:id — Update user
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const existing = await db.user.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check for duplicate email if being changed
    if (body.email && body.email !== existing.email) {
      const emailTaken = await db.user.findUnique({
        where: { email: body.email },
      });
      if (emailTaken) {
        return NextResponse.json(
          { error: 'Email is already in use' },
          { status: 409 }
        );
      }
    }

    // Check for duplicate RUT if being changed
    if (body.rut && body.rut !== existing.rut) {
      const rutTaken = await db.user.findUnique({
        where: { rut: body.rut },
      });
      if (rutTaken) {
        return NextResponse.json(
          { error: 'RUT is already in use' },
          { status: 409 }
        );
      }
    }

    // Build update data
    const updateData: Record<string, unknown> = {};
    const allowedFields = [
      'email', 'passwordHash', 'name', 'phone', 'rut',
      'role', 'kycStatus', 'avatarUrl', 'stripeCustomerId',
      'balance', 'totalInvested', 'totalEarnings',
    ];

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    // Handle date fields
    if (body.kycSubmittedAt !== undefined) {
      updateData.kycSubmittedAt = body.kycSubmittedAt
        ? new Date(body.kycSubmittedAt)
        : null;
    }
    if (body.kycVerifiedAt !== undefined) {
      updateData.kycVerifiedAt = body.kycVerifiedAt
        ? new Date(body.kycVerifiedAt)
        : null;
    }

    const user = await db.user.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/users/:id — Delete user
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const existing = await db.user.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check for active investments
    const activeInvestments = await db.investment.count({
      where: { userId: id, status: { in: ['active', 'pending'] } },
    });

    if (activeInvestments > 0) {
      return NextResponse.json(
        { error: `Cannot delete user with ${activeInvestments} active investment(s). Resolve investments first.` },
        { status: 400 }
      );
    }

    await db.user.delete({ where: { id } });

    return NextResponse.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    );
  }
}
