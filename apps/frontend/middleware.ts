import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export const config = {
  matcher: [
    '/',
    '/owner/:path*',
    '/coach/:path*',
    '/member/:path*',
    '/login',
    '/register'
  ]
};

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const pathname = request.nextUrl.pathname;
  if(!token) {
    if(pathname.startsWith('/login') || pathname.startsWith('/register')) {
      return NextResponse.next();
    }
    return NextResponse.redirect(new URL('/login', request.url));
  }

  const role = JSON.parse(atob(token.split('.')[1])).role;

  if(pathname.startsWith('/login') || pathname.startsWith('/register')) {
    return NextResponse.redirect(new URL(`/${role}/dashboard`, request.url));
  }
  if(!pathname.startsWith(`/${role}`)){
    return NextResponse.redirect(new URL(`/${role}/dashboard`, request.url));
  }
  return NextResponse.next();
}