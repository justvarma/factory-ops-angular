import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';

export interface AuthUser {
  id: string;
  username: string;
  email: string;
  role: string;
}

export async function createToken(user: AuthUser) {
  return jwt.sign(user, JWT_SECRET, { expiresIn: '1d' });
}

export async function verifyToken(token: string): Promise<AuthUser | null> {
  try {
    return jwt.verify(token, JWT_SECRET) as AuthUser;
  } catch (error) {
    return null;
  }
}

export async function getAuthUser(): Promise<AuthUser | null> {
  const cookieStore = await cookies();
  const token = (await cookieStore).get('auth_token')?.value;
  if (!token) {
    console.log('No auth_token found in cookies');
    return null;
  }
  const verified = await verifyToken(token);
  if (!verified) {
    console.log('Token verification failed');
  }
  return verified;
}
