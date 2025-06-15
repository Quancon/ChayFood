import { NextRequest, NextResponse } from 'next/server'
// @ts-ignore
import acceptLanguage from 'accept-language'
import { fallbackLng, languages } from '@/i18n/settings'

acceptLanguage.languages(languages)

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|sw.js|.*\\.(?:png|jpg|jpeg|gif|svg|webp|ico|json|txt|webmanifest)).*)'
  ]
}

const cookieName = 'i18next'

export function middleware(req: NextRequest) {
  let lng
  if (req.cookies.has(cookieName)) lng = acceptLanguage.get(req.cookies.get(cookieName)?.value)
  if (!lng) lng = acceptLanguage.get(req.headers.get('Accept-Language'))
  if (!lng) lng = fallbackLng

  // Redirect if lng in path is not supported
  if (
    !languages.some(loc => req.nextUrl.pathname.startsWith(`/${loc}`)) &&
    !req.nextUrl.pathname.startsWith('/_next')
  ) {
    return NextResponse.redirect(new URL(`/${lng}${req.nextUrl.pathname}`, req.url))
  }

  const referer = req.headers.get('referer')
  if (referer) {
    const refererUrl = new URL(referer)
    const lngInReferer = languages.find((l) => refererUrl.pathname.startsWith(`/${l}`))
    const response = NextResponse.next()
    if (lngInReferer) response.cookies.set(cookieName, lngInReferer)
    return response
  }
  
  // Get the pathname of the request
  const pathname = req.nextUrl.pathname;

  // Get the auth token from cookies
  const authToken = req.cookies.get('authToken')?.value;
  
  // Check if there's a current user cookie that contains role information
  const currentUserCookie = req.cookies.get('currentUser')?.value;
  let isAdmin = false;
  
  if (currentUserCookie) {
    try {
      const userData = JSON.parse(currentUserCookie);
      isAdmin = userData.role === 'admin';
    } catch (error) {
      console.error('Error parsing currentUser cookie:', error);
    }
  }
  
  // If the user is authenticated and is an admin, redirect to the admin dashboard
  // This check should run on all page navigations to ensure admins are always on the correct dashboard
  if (authToken && isAdmin && !pathname.startsWith(`/${lng}/admin`)) {
    return NextResponse.redirect(new URL(`/${lng}/admin`, req.url));
  }

  return NextResponse.next()
} 