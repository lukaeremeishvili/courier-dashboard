import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  console.log(`[Middleware] Path: ${req.nextUrl.pathname}`); // Log path
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const {
    data: { session },
    error: sessionError, // Check for session errors too
  } = await supabase.auth.getSession()

  console.log("[Middleware] Session fetched:", session ? `User ID: ${session.user.id}` : 'No session', "Error:", sessionError);

  // Allow access to registration page
  if (req.nextUrl.pathname.startsWith('/register')) {
    console.log("[Middleware] Allowing /register");
    return res
  }

  // If user is not signed in and the current path is not /login
  // redirect the user to /login
  if (!session && !req.nextUrl.pathname.startsWith('/login')) {
    console.log("[Middleware] No session, redirecting to /login");
    return NextResponse.redirect(new URL('/login', req.url))
  }

  // If user is signed in and the current path is /login or /
  // redirect the user to their dashboard
  if (session && (req.nextUrl.pathname === '/login' || req.nextUrl.pathname === '/')) {
    console.log("[Middleware] Session found, path is /login or /. Attempting redirect to dashboard...");
    try {
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('role')
        .eq('id', session.user.id)
        .single()

      console.log("[Middleware] User role fetched:", user, "Error:", userError);

      if (user && user.role) {
        const redirectUrl = `/${user.role}/dashboard`;
        console.log(`[Middleware] User role '${user.role}' found, redirecting to ${redirectUrl}`);
        return NextResponse.redirect(new URL(redirectUrl, req.url))
      } else {
        console.log("[Middleware] User role not found or missing. Allowing request to proceed to:", req.nextUrl.pathname);
        // If role not found, maybe redirect to login or a generic error page?
        // For now, letting it proceed might cause the / page to redirect back to /login
      }
    } catch (error) {
        console.error("[Middleware] Error fetching user role:", error);
        // Decide how to handle this error, maybe redirect to login?
    }
  }

  console.log("[Middleware] No redirect conditions met, allowing request to proceed.");
  return res
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
} 