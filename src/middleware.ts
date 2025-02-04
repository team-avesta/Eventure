import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Only apply to /api/s3/screenshots route
  if (request.nextUrl.pathname === '/api/s3/screenshots') {
    const response = NextResponse.next();
    response.headers.set('Client-Max-Body-Size', '15m');
    return response;
  }
  return NextResponse.next();
}

export const config = {
  matcher: '/api/s3/screenshots',
};
