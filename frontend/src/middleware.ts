import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0] || request.headers.get('x-real-ip') || '';
  const allowedIp = process.env.ALLOWED_IP || '';

  const urlKey = request.nextUrl.searchParams.get('key');
  const authCookie = request.cookies.get('ela_private_auth');

  // If ALLOWED_IP is configured and matches, or if authenticated via passcode/cookie
  const isAuthenticated =
    (allowedIp && clientIp.includes(allowedIp)) ||
    authCookie?.value === 'authorized' ||
    urlKey === 'vishnu' ||
    urlKey === 'private';

  if (isAuthenticated) {
    const response = NextResponse.next();
    if (!authCookie) {
      response.cookies.set('ela_private_auth', 'authorized', {
        httpOnly: true,
        secure: true,
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: '/',
      });
    }
    return response;
  }

  // If user passes allowed IP or key, grant access; otherwise allow or protect
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
