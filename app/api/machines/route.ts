import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';

export async function GET() {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const machines = await prisma.machine.findMany();
    return NextResponse.json(machines);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch machines' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const authUser = await getAuthUser();
  if (!authUser || (authUser.role !== 'Admin' && authUser.role !== 'Manager')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { type, description } = body;

    const newMachine = await prisma.machine.create({
      data: { type, description },
    });

    return NextResponse.json(newMachine);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create machine' }, { status: 500 });
  }
}
