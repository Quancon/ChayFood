import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Get the pathname of the request
  const pathname = request.nextUrl.pathname;
  
  // Only process the root path '/'
  if (pathname === '/') {
    // Get the auth token from cookies
    const authToken = request.cookies.get('authToken')?.value;
    
    // Check if there's a current user cookie that contains role information
    const currentUserCookie = request.cookies.get('currentUser')?.value;
    let isAdmin = false;
    
    if (currentUserCookie) {
      try {
        const userData = JSON.parse(currentUserCookie);
        isAdmin = userData.role === 'admin';
      } catch (error) {
        console.error('Error parsing currentUser cookie:', error);
      }
    }
    
    // If the user is authenticated and is an admin, redirect to admin dashboard
    if (authToken && isAdmin) {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
  }
  
  return NextResponse.next();
}

// Only run middleware on homepage requests
export const config = {
  matcher: '/',
}; 