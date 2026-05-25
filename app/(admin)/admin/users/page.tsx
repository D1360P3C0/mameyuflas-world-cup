/**
 * Admin Usuarios — Server Component
 *
 * Carga todos los perfiles desde Supabase y los pasa al cliente
 * para que sean interactivos (bonus, ban, pays_entry).
 */
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { UsersClient, type AdminUser } from './UsersClient'

export const metadata: Metadata = { title: 'Gestión de Usuarios · Admin' }

export default async function AdminUsersPage() {
  const supabase = await createClient()

  /* Obtener todos los perfiles con los campos de admin */
  const { data, error } = await supabase
    .from('profiles')
    .select('id, username, display_name, avatar_url, is_admin, bonus_points, is_banned_fanzone, pays_entry')
    .order('display_name', { ascending: true })

  const users = (data ?? []) as AdminUser[]

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-bold text-[#FF5E9F] uppercase">
          Gestión de Usuarios
        </h1>
        <p className="font-mono text-[11px] text-white/40 uppercase tracking-widest mt-1">
          {users.length} participantes registrados
        </p>
        {error && (
          <p className="mt-2 text-sm text-[#f87171] font-mono">Error: {error.message}</p>
        )}
      </div>

      <UsersClient users={users} />
    </div>
  )
}
