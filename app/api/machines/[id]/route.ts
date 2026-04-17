import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const authUser = await getAuthUser();
  if (!authUser || (authUser.role !== 'Admin' && authUser.role !== 'Manager')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { type, description } = body;
    const machine = await prisma.machine.update({
      where: { id: parseInt(params.id) },
      data: { type, description }
    });
    return NextResponse.json(machine);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update machine' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const authUser = await getAuthUser();
  if (!authUser || authUser.role !== 'Admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    await prisma.machine.delete({
      where: { id: parseInt(params.id) }
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete machine' }, { status: 500 });
  }
}
