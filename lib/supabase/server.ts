/**
 * Cliente de Supabase para el SERVIDOR (Server Components, Server Actions, Route Handlers).
 *
 * Lee/escribe cookies para mantener la sesión del usuario en el servidor.
 * Respeta el RLS automáticamente usando el JWT del usuario.
 *
 * NO usar en Client Components — usar lib/supabase/client.ts en su lugar.
 * NO usar en middleware.ts — usar lib/supabase/middleware.ts en su lugar.
 */
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '@/types/database.types'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Server Component no puede escribir cookies.
            // El middleware se encarga del refresh de sesión.
          }
        },
      },
    }
  )
}
