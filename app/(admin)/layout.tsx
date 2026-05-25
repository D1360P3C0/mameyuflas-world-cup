/**
 * Layout del panel de administración.
 *
 * • Verifica que el usuario sea admin (server-side).
 * • Sidebar/header con navegación entre secciones.
 * • Aislado del layout principal (sin bottom nav de usuario).
 */
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

const NAV_LINKS = [
  { href: '/admin/dashboard', label: 'Dashboard',  icon: 'dashboard' },
  { href: '/admin/matches',   label: 'Partidos',   icon: 'sports_soccer' },
  { href: '/admin/users',     label: 'Usuarios',   icon: 'group' },
]

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  /* Verificar sesión y permisos admin ──────────────────────── */
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin, display_name')
    .eq('id', user.id)
    .single()

  if (!profile?.is_admin) redirect('/')

  return (
    <div className="flex min-h-dvh flex-col bg-[#0F0F1E] text-white">

      {/* ── Header ──────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 border-b border-white/8 bg-[#0F0F1E]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center gap-6 px-4 py-3">

          {/* Logo/title */}
          <Link href="/admin/dashboard" className="flex items-center gap-2 shrink-0">
            <span
              className="material-symbols-outlined text-[20px] text-[#FF5E9F]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              shield_person
            </span>
            <span className="font-mono text-xs font-bold uppercase tracking-widest text-[#FF5E9F]">
              MWC Admin
            </span>
          </Link>

          {/* Nav links */}
          <nav className="flex flex-1 items-center gap-1">
            {NAV_LINKS.map(({ href, label, icon }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-mono text-[11px] font-semibold uppercase tracking-wider text-white/50 transition-all hover:bg-white/5 hover:text-white"
              >
                <span className="material-symbols-outlined text-[16px]">{icon}</span>
                {label}
              </Link>
            ))}
          </nav>

          {/* Volver a la app */}
          <Link
            href="/"
            className="flex items-center gap-1 font-mono text-[11px] text-white/30 hover:text-white/60 transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            App
          </Link>
        </div>
      </header>

      {/* ── Contenido ───────────────────────────────────────── */}
      <main className="flex-1 p-4 sm:p-6 mx-auto w-full max-w-5xl">
        {children}
      </main>
    </div>
  )
}
