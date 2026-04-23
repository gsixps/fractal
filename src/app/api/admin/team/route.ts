import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/admin/team - List all team members
export async function GET() {
  try {
    const members = await db.teamMember.findMany({
      orderBy: { sortOrder: 'asc' },
    })

    return NextResponse.json(members)
  } catch (error) {
    console.error('Error fetching team members:', error)
    return NextResponse.json({ error: 'Failed to fetch team members' }, { status: 500 })
  }
}

// POST /api/admin/team - Create new team member
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, role, bio, photoUrl, linkedinUrl, sortOrder, isActive } = body

    if (!name || !role) {
      return NextResponse.json({ error: 'name and role are required' }, { status: 400 })
    }

    const member = await db.teamMember.create({
      data: {
        name,
        role,
        bio: bio || '',
        photoUrl,
        linkedinUrl,
        sortOrder: sortOrder ?? 0,
        isActive: isActive ?? true,
      },
    })

    return NextResponse.json(member, { status: 201 })
  } catch (error) {
    console.error('Error creating team member:', error)
    return NextResponse.json({ error: 'Failed to create team member' }, { status: 500 })
  }
}
