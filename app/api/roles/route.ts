import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';

export async function GET() {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const roles = await prisma.role.findMany({
      include: {
        _count: {
          select: { users: true }
        }
      }
    });
    return NextResponse.json(roles);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch roles' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const user = await getAuthUser();
  if (!user || user.role !== 'Admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { name, description } = await request.json();
    const role = await prisma.role.create({
      data: { name, description }
    });
    return NextResponse.json(role);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create role' }, { status: 500 });
  }
}
