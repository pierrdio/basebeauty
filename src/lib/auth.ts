import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key';

export interface AuthUser {
  userId: number;
  login: string;
}

export function verifyAuth(request: NextRequest): AuthUser | null {
  try {
    const token = request.cookies.get('auth-token')?.value;

    if (!token) {
      return null;
    }

    const decoded = jwt.verify(token, JWT_SECRET) as AuthUser;
    return decoded;
  } catch (error) {
    console.error('Auth verification error:', error);
    return null;
  }
}

export function createAuthCookie(token: string) {
  return `auth-token=${token}; HttpOnly; Secure=${process.env.NODE_ENV === 'production'}; SameSite=lax; Max-Age=${24 * 60 * 60}; Path=/`;
}

export function clearAuthCookie() {
  return 'auth-token=; HttpOnly; Secure=' + (process.env.NODE_ENV === 'production') + '; SameSite=lax; Max-Age=0; Path=/';
}
