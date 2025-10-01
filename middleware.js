import { NextResponse } from 'next/server'
import { NextRequest } from 'next/server'
import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'

// Use a consistent JWT secret
const secret = new TextEncoder().encode('your-super-secret-jwt-key-change-this-in-production-12345')

async function verifySession() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('session')?.value

    if (!token) {
      console.log('🔍 Auth: No session token found')
      return null
    }

    console.log('🔍 Auth: Session token found, verifying...')
    const { payload } = await jwtVerify(token, secret)
    console.log('✅ Auth: Session verified successfully')
    return payload
  } catch (error) {
    console.log('❌ Auth: Session verification failed:', error.message)
    return null
  }
}

export async function middleware(request) {
  const { pathname } = request.nextUrl
  
  console.log('🔍 Middleware executing for:', pathname)

  // Allow static assets (images, styles, scripts, fonts, maps, etc.) without auth
  if (/\.(?:png|jpg|jpeg|webp|svg|gif|ico|css|js|map|txt|xml|json|woff|woff2|ttf|otf)$/i.test(pathname)) {
    return NextResponse.next()
  }
  
  // Public routes that don't require authentication
  const publicRoutes = [
    '/',
    '/login',
    '/track',
    '/api/auth/login',
    '/api/complaints',
    '/api/complaints/classify',
    '/api/categories',
    '/api/barangays',
    '/api/track'
  ]
  
  // Check if the current path is a public route
  if (publicRoutes.includes(pathname)) {
    console.log('✅ Public route, allowing access:', pathname)
    return NextResponse.next()
  }

  console.log('🔐 Protected route, checking authentication...')
  
  // Check authentication for protected routes
  const session = await verifySession()
  console.log('🔑 Session result:', session ? 'Found' : 'Not found')
  
  // If no session and trying to access protected route, redirect to login
  if (!session) {
    console.log('❌ No session, redirecting to login')
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }
    
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }
  
  console.log('✅ Session found, allowing access')

  // Add user info to headers for API routes
  if (pathname.startsWith('/api/')) {
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('x-user-id', session.userId.toString())
    requestHeaders.set('x-user-role', session.role)
    
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/dashboard',
    '/profile',
    '/settings',
    '/api/complaints',
    '/api/categories',
    '/((?!_next/static|_next/image|favicon.ico|public|login|register).*)',
  ],
}
