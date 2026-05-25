/**
 * Callback de OAuth de Supabase Auth.
 * Este endpoint maneja el redirect después del login con Google u otros providers OAuth.
 * También maneja el magic link y el reset de contraseña.
 *
 * Supabase redirige aquí después de autenticación OAuth con un `code`.
 * El handler intercambia el code por una sesión y redirige al usuario.
 */
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { ROUTES } from '@/lib/constants/routes'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? ROUTES.DASHBOARD

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // Error — redirigir al login con mensaje de error
  return NextResponse.redirect(`${origin}${ROUTES.LOGIN}?error=auth_callback_error`)
}
