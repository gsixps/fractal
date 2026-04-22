import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/admin/users — List all users with filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');
    const kycStatus = searchParams.get('kycStatus');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    if (role) where.role = role;
    if (kycStatus) where.kycStatus = kycStatus;
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
        { rut: { contains: search } },
      ];
    }

    const [users, total] = await Promise.all([
      db.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          name: true,
          phone: true,
          rut: true,
          role: true,
          kycStatus: true,
          balance: true,
          totalInvested: true,
          totalEarnings: true,
          createdAt: true,
          _count: {
            select: {
              investments: true,
              transactions: true,
              dividendPayments: true,
              kycDocuments: true,
            },
          },
        },
      }),
      db.user.count({ where }),
    ]);

    return NextResponse.json({
      users,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('Error listing users:', error);
    return NextResponse.json({ error: 'Failed to list users' }, { status: 500 });
  }
}

// POST /api/admin/users — Create a new user
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (body.email) {
      const existingEmail = await db.user.findUnique({ where: { email: body.email } });
      if (existingEmail) {
        return NextResponse.json({ error: 'A user with this email already exists' }, { status: 409 });
      }
    }

    if (body.rut) {
      const existingRut = await db.user.findUnique({ where: { rut: body.rut } });
      if (existingRut) {
        return NextResponse.json({ error: 'A user with this RUT already exists' }, { status: 409 });
      }
    }

    const userData: Record<string, unknown> = {
      email: body.email || '',
      name: body.name || null,
      phone: body.phone || null,
      rut: body.rut || null,
      role: body.role || 'investor',
      kycStatus: body.kycStatus || 'pending',
      balance: Number(body.balance) || 0,
      totalInvested: Number(body.totalInvested) || 0,
      totalEarnings: Number(body.totalEarnings) || 0,
    };

    const user = await db.user.create({ data: userData });

    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
}
