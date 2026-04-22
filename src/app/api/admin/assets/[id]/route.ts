import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/admin/assets/:id — Get single asset with all related data
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const asset = await db.asset.findUnique({
      where: { id },
      include: {
        images: { orderBy: { sortOrder: 'asc' } },
        documents: true,
        cashFlowProjections: { orderBy: { period: 'asc' } },
        investments: {
          include: {
            user: { select: { id: true, name: true, email: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!asset) {
      return NextResponse.json(
        { error: 'Asset not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ asset });
  } catch (error) {
    console.error('Error fetching asset:', error);
    return NextResponse.json(
      { error: 'Failed to fetch asset' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/assets/:id — Update asset
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const existing = await db.asset.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: 'Asset not found' },
        { status: 404 }
      );
    }

    // Handle slug update
    if (body.slug && body.slug !== existing.slug) {
      const slugTaken = await db.asset.findUnique({
        where: { slug: body.slug },
      });
      if (slugTaken) {
        return NextResponse.json(
          { error: 'Slug is already taken' },
          { status: 409 }
        );
      }
    }

    // Build update data — exclude relations (handled separately)
    const {
      images: _images,
      documents: _documents,
      cashFlowProjections: _cfp,
      ...updateData
    } = body;

    // Convert date strings to Date objects
    if (updateData.leaseStart) updateData.leaseStart = new Date(updateData.leaseStart as string);
    if (updateData.leaseEnd) updateData.leaseEnd = new Date(updateData.leaseEnd as string);

    const asset = await db.asset.update({
      where: { id },
      data: updateData,
      include: {
        images: { orderBy: { sortOrder: 'asc' } },
        documents: true,
        cashFlowProjections: { orderBy: { period: 'asc' } },
      },
    });

    // Handle images replacement if provided
    if (_images !== undefined) {
      await db.assetImage.deleteMany({ where: { assetId: id } });
      if (_images.length > 0) {
        await db.assetImage.createMany({
          data: _images.map(
            (img: { url: string; alt?: string; sortOrder?: number; isCover?: boolean }, i: number) => ({
              assetId: id,
              url: img.url,
              alt: img.alt || '',
              sortOrder: img.sortOrder ?? i,
              isCover: img.isCover ?? false,
            })
          ),
        });
      }
    }

    // Handle documents replacement if provided
    if (_documents !== undefined) {
      await db.assetDocument.deleteMany({ where: { assetId: id } });
      if (_documents.length > 0) {
        await db.assetDocument.createMany({
          data: _documents.map(
            (doc: { title: string; documentType: string; fileUrl: string; fileSize?: number }) => ({
              assetId: id,
              title: doc.title,
              documentType: doc.documentType,
              fileUrl: doc.fileUrl,
              fileSize: doc.fileSize,
            })
          ),
        });
      }
    }

    // Handle cash flow projections replacement if provided
    if (_cfp !== undefined) {
      await db.cashFlowProjection.deleteMany({ where: { assetId: id } });
      if (_cfp.length > 0) {
        await db.cashFlowProjection.createMany({
          data: _cfp.map(
            (cfp: {
              period: string;
              periodType?: string;
              grossIncome: number;
              operationalCost: number;
              netIncome: number;
              appreciation?: number;
              totalReturn?: number;
              cumulativeReturn?: number;
            }) => ({
              assetId: id,
              period: cfp.period,
              periodType: cfp.periodType || 'yearly',
              grossIncome: cfp.grossIncome,
              operationalCost: cfp.operationalCost,
              netIncome: cfp.netIncome,
              appreciation: cfp.appreciation,
              totalReturn: cfp.totalReturn,
              cumulativeReturn: cfp.cumulativeReturn,
            })
          ),
        });
      }
    }

    // Return updated asset with fresh relations
    const updatedAsset = await db.asset.findUnique({
      where: { id },
      include: {
        images: { orderBy: { sortOrder: 'asc' } },
        documents: true,
        cashFlowProjections: { orderBy: { period: 'asc' } },
      },
    });

    return NextResponse.json({ asset: updatedAsset });
  } catch (error) {
    console.error('Error updating asset:', error);
    return NextResponse.json(
      { error: 'Failed to update asset' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/assets/:id — Delete asset and cascade
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const existing = await db.asset.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: 'Asset not found' },
        { status: 404 }
      );
    }

    // Check if asset has active investments
    const activeInvestments = await db.investment.count({
      where: { assetId: id, status: { in: ['active', 'completed'] } },
    });

    if (activeInvestments > 0) {
      return NextResponse.json(
        { error: `Cannot delete asset with ${activeInvestments} active investment(s). Deactivate investments first.` },
        { status: 400 }
      );
    }

    await db.asset.delete({ where: { id } });

    return NextResponse.json({ message: 'Asset deleted successfully' });
  } catch (error) {
    console.error('Error deleting asset:', error);
    return NextResponse.json(
      { error: 'Failed to delete asset' },
      { status: 500 }
    );
  }
}
