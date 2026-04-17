import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export async function GET() {
  const user = await getAuthUser();
  console.log('API GET /api/users - Auth User:', user);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const users = await prisma.users.findMany({
      include: { role: true },
      orderBy: { username: 'asc' },
    });
    console.log('API GET /api/users - Found users count:', users.length);
    return NextResponse.json(users);
  } catch (error) {
    console.error('API GET /api/users - Error:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const authUser = await getAuthUser();
  if (!authUser || authUser.role !== 'Admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { username, email, mobile_no, password, role_id, doj, process: userProcess } = body;

    const newUser = await prisma.users.create({
      data: {
        username,
        email,
        mobile_no,
        password: password,
        role_id: parseInt(role_id),
        doj: doj ? new Date(doj) : null,
        process: userProcess,
      },
    });

    return NextResponse.json(newUser);
  } catch (error) {
    console.error('Create user error:', error);
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
}
