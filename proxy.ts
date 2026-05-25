/**
 * Proxy de Next.js para Mameyuflas World Cup.
 *
 * (Anteriormente llamado "middleware" — en Next.js 15 se renombró a "proxy")
 *
 * Responsabilidades:
 * 1. Refrescar el token de sesión de Supabase en cada request (SSR Auth)
 * 2. Proteger rutas del área principal (main) — redirige a /login si no hay sesión
 * 3. Proteger rutas de admin — redirige a /dashboard si no es admin
 * 4. Redirigir usuarios ya logueados que visiten /login o /register
 *
 * IMPORTANTE: Este proxy DEBE crear el cliente de Supabase usando
 * lib/supabase/middleware.ts, que gestiona correctamente las cookies en Edge.
 */
import { type NextRequest, NextResponse } from 'next/server'
import { createMiddlewareClient } from '@/lib/supabase/middleware'
import { ROUTES } from '@/lib/constants/routes'

// Rutas que requieren autenticación
const PROTECTED_ROUTES = [
  '/dashboard',
  '/predictions',
  '/matches',
  '/leaderboard',
  '/leagues',
  '/profile',
  '/news',
]

// Rutas de admin (requieren is_admin = true)
const ADMIN_ROUTES = ['/admin']

// Rutas de autenticación (redirigen al dashboard si ya hay sesión)
const AUTH_ROUTES = [ROUTES.LOGIN, ROUTES.REGISTER, ROUTES.FORGOT_PASSWORD]

export async function proxy(request: NextRequest) {
  const { supabase, response } = await createMiddlewareClient(request)
  const pathname = request.nextUrl.pathname

  // Refrescar sesión (CRÍTICO para SSR con Supabase Auth)
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Si la ruta requiere autenticación y no hay usuario → login
  const isProtectedRoute = PROTECTED_ROUTES.some((route) =>
    pathname.startsWith(route)
  )
  if (isProtectedRoute && !user) {
    const redirectUrl = new URL(ROUTES.LOGIN, request.url)
    redirectUrl.searchParams.set('redirectTo', pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // Si la ruta es de admin → verificar is_admin
  const isAdminRoute = ADMIN_ROUTES.some((route) => pathname.startsWith(route))
  if (isAdminRoute) {
    if (!user) {
      return NextResponse.redirect(new URL(ROUTES.LOGIN, request.url))
    }

    // Verificar is_admin en la DB
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single()

    if (!profile?.is_admin) {
      return NextResponse.redirect(new URL(ROUTES.DASHBOARD, request.url))
    }
  }

  // Si el usuario ya está autenticado y visita auth routes → dashboard
  const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route))
  if (isAuthRoute && user) {
    return NextResponse.redirect(new URL(ROUTES.DASHBOARD, request.url))
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Ejecutar el proxy en todas las rutas excepto:
     * - _next/static (archivos estáticos)
     * - _next/image (optimización de imágenes)
     * - favicon.ico
     * - archivos de public/ con extensión
     */
    '/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
