/**
 * Admin Dashboard — Vista rápida del estado del torneo.
 */
import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = { title: 'Dashboard · Admin' }

export default async function AdminDashboardPage() {
  const supabase = await createClient()

  /* Stats rápidas en paralelo */
  const [usersRes, matchesRes, postsRes] = await Promise.all([
    supabase.from('profiles').select('id', { count: 'exact', head: true }),
    supabase.from('matches').select('id, status', { count: 'exact' }).limit(1000),
    supabase.from('fan_posts').select('id', { count: 'exact', head: true }),
  ])

  const totalUsers   = usersRes.count ?? 0
  const totalPosts   = postsRes.count ?? 0
  const allMatches   = matchesRes.data ?? []
  const totalMatches = allMatches.length
  const liveMatches  = allMatches.filter((m) => m.status === 'live').length
  const finishedMatches = allMatches.filter((m) => m.status === 'finished').length

  const cards = [
    { label: 'Usuarios',    value: totalUsers,     icon: 'group',          color: 'text-[#ffb0c9]', href: '/admin/users'   },
    { label: 'Partidos',    value: totalMatches,   icon: 'sports_soccer',  color: 'text-[#8B5CF6]', href: '/admin/matches' },
    { label: 'En Vivo',     value: liveMatches,    icon: 'live_tv',        color: 'text-[#00dce5]', href: '/admin/matches' },
    { label: 'Finalizados', value: finishedMatches, icon: 'check_circle',  color: 'text-[#4ade80]', href: '/admin/matches' },
    { label: 'Posts Fan Zone', value: totalPosts,  icon: 'forum',          color: 'text-[#FF5E9F]', href: '/'              },
  ]

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-bold text-[#FF5E9F] uppercase">Dashboard</h1>
        <p className="font-mono text-[11px] text-white/40 uppercase tracking-widest mt-1">
          Estado general del torneo
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-8">
        {cards.map(({ label, value, icon, color, href }) => (
          <Link
            key={label}
            href={href}
            className="glass-card rounded-xl p-4 text-center hover:border-white/15 transition-colors group"
          >
            <span
              className={`material-symbols-outlined text-[28px] mb-2 ${color} group-hover:scale-110 transition-transform inline-block`}
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              {icon}
            </span>
            <p className={`font-heading font-bold text-2xl ${color}`}>{value}</p>
            <p className="font-mono text-[10px] text-white/40 uppercase">{label}</p>
          </Link>
        ))}
      </div>

      {/* Accesos rápidos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link
          href="/admin/matches"
          className="glass-card rounded-xl p-5 hover:border-white/15 transition-colors group"
        >
          <div className="flex items-center gap-3 mb-2">
            <span
              className="material-symbols-outlined text-[24px] text-[#8B5CF6]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              edit_square
            </span>
            <h2 className="font-heading font-bold text-white">Actualizar resultados</h2>
          </div>
          <p className="font-body text-sm text-white/50">
            Introduce los marcadores de los partidos jugados para activar el sistema de puntuación.
          </p>
        </Link>

        <Link
          href="/admin/users"
          className="glass-card rounded-xl p-5 hover:border-white/15 transition-colors group"
        >
          <div className="flex items-center gap-3 mb-2">
            <span
              className="material-symbols-outlined text-[24px] text-[#FF5E9F]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              manage_accounts
            </span>
            <h2 className="font-heading font-bold text-white">Gestionar usuarios</h2>
          </div>
          <p className="font-body text-sm text-white/50">
            Puntos bonus, vetos del Fan Zone y marca quién participa con dinero.
          </p>
        </Link>
      </div>
    </div>
  )
}
