/**
 * Cliente de Supabase para el BROWSER (Client Components).
 *
 * Uso: en componentes con "use client" que necesiten acceder a Supabase.
 * Respeta automáticamente el RLS usando el JWT del usuario autenticado.
 *
 * NO usar en Server Components — usar lib/supabase/server.ts en su lugar.
 */
import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/types/database.types'

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
