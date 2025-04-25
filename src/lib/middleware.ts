import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';


interface NextRequestWithUser extends NextRequest {
  user?: { role: string };
}

export async function middleware(req: NextRequestWithUser) {
  const token = req.cookies.get('auth_token')?.value || req.headers.get('Authorization')?.split(' ')[1];

  if (!token) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET));

    if (!payload || typeof payload !== 'object' || !('role' in payload)) {
      return NextResponse.redirect(new URL('/login', req.url));
    }

    if (typeof payload.role === 'string') {
      req.user = { role: payload.role };
    } else {
      throw new Error('Invalid token payload: role is not a string');
    }
    const protectedRoutes = ['/dashboard/user', '/dashboard/courier', '/dashboard/admin'];

    if (protectedRoutes.some(route => req.nextUrl.pathname.startsWith(route))) {
      const userRole = req.user?.role;

      if (userRole === 'admin' && req.nextUrl.pathname !== '/dashboard/admin') {
        return NextResponse.redirect(new URL('/dashboard/admin', req.url));
      }
      if (userRole === 'courier' && req.nextUrl.pathname !== '/dashboard/courier') {
        return NextResponse.redirect(new URL('/dashboard/courier', req.url));
      }
      if (userRole === 'user' && req.nextUrl.pathname !== '/dashboard/user') {
        return NextResponse.redirect(new URL('/dashboard/user', req.url));
      }

      return NextResponse.next();
    }
  } catch (error) {
    console.error('JWT Verification failed:', error);
    return NextResponse.redirect(new URL('/login', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/*'],
};
