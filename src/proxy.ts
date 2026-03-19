import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const secretKey = process.env.SESSION_SECRET || 'super-secret-key-for-quiz-platform';
const encodedKey = new TextEncoder().encode(secretKey);

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  
  // Protect /admin routes and /quiz taking routes
  const isProtected = pathname.startsWith('/admin') || pathname.startsWith('/quiz');
  const isAdminRoute = pathname.startsWith('/admin');
  const isAuthRoute = pathname.startsWith('/auth');

  const cookie = req.cookies.get('auth_token')?.value;

  let session = null;
  if (cookie) {
    try {
        const { payload } = await jwtVerify(cookie, encodedKey, {
        algorithms: ['HS256'],
        });
        session = payload as { userId: string, role: string };
    } catch {
        session = null;
    }
  }

  // Redirect unauthenticated from protected routes
  if (isProtected && !session) {
    return NextResponse.redirect(new URL('/auth/login', req.nextUrl));
  }

  // Redirect non-admins from admin routes
  if (isAdminRoute && session?.role !== 'ADMIN') {
    return NextResponse.redirect(new URL('/', req.nextUrl));
  }

  // Redirect authenticated users away from login/signup
  if (isAuthRoute && session) {
    return NextResponse.redirect(new URL('/', req.nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
