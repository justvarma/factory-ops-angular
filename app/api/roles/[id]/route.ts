import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const user = await getAuthUser();
  if (!user || user.role !== 'Admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await request.json();
    const { name, description } = body;
    const role = await prisma.role.update({
      where: { id: parseInt(params.id) },
      data: { name, description }
    });
    return NextResponse.json(role);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update role' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const user = await getAuthUser();
  if (!user || user.role !== 'Admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    await prisma.role.delete({
      where: { id: parseInt(params.id) }
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete role' }, { status: 500 });
  }
}
