import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  
  // Add pathname to headers for use in layout
  response.headers.set("x-pathname", request.nextUrl.pathname);
  
  // Debug logging
  console.log('Middleware - Path:', request.nextUrl.pathname);
  
  // Check authentication for protected routes
  const protectedRoutes = ['/dashboard', '/admin'];
  const isProtectedRoute = protectedRoutes.some(route => 
    request.nextUrl.pathname.startsWith(route)
  );
  
  // Allow access to login page and API routes
  const publicRoutes = ['/admin-login', '/api/auth'];
  const isPublicRoute = publicRoutes.some(route => 
    request.nextUrl.pathname.startsWith(route)
  );
  
  console.log('Middleware - Protected:', isProtectedRoute, 'Public:', isPublicRoute);
  
  if (isProtectedRoute && !isPublicRoute) {
    const token = request.cookies.get('auth-token')?.value;
    console.log('Middleware - Token exists:', !!token);
    
    if (!token) {
      console.log('Middleware - No token, redirecting to login');
      // Redirect to login if no token
      return NextResponse.redirect(new URL('/admin-login', request.url));
    }
    
    try {
      // Verify token
      jwt.verify(token, JWT_SECRET);
      console.log('Middleware - Token valid');
    } catch (error) {
      console.log('Middleware - Token invalid, redirecting to login:', error);
      // Token invalid, redirect to login
      return NextResponse.redirect(new URL('/admin-login', request.url));
    }
  }
  
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
  runtime: 'nodejs',
};
