'use client'

/**
 * Admin Usuarios — Client Component
 *
 * Controles interactivos por usuario:
 *  • 💰 pays_entry toggle
 *  • 🚫 is_banned_fanzone toggle
 *  • ± bonus_points (–5 –1 pts +1 +5)
 */
import { useState, useTransition } from 'react'
import { cn } from '@/lib/utils/cn'
import {
  updateUserBonusPointsAction,
  setBanFanzoneAction,
  setPaysEntryAction,
} from '@/features/admin/actions/admin.actions'

/* ── Tipo local de usuario ──────────────────────────────────── */
export interface AdminUser {
  id: string
  username: string
  display_name: string
  avatar_url: string | null
  is_admin: boolean
  bonus_points: number
  is_banned_fanzone: boolean
  pays_entry: boolean
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

/* ── UserRow ────────────────────────────────────────────────── */
function UserRow({ user }: { user: AdminUser }) {
  const [bonus, setBonus] = useState(user.bonus_points)
  const [banned, setBanned] = useState(user.is_banned_fanzone)
  const [pays, setPays] = useState(user.pays_entry)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const handleBonus = (delta: number) => {
    startTransition(async () => {
      setError(null)
      const res = await updateUserBonusPointsAction(user.id, delta)
      if ('error' in res) {
        setError(res.error)
      } else {
        setBonus(res.newPoints)
      }
    })
  }

  const handleBan = (val: boolean) => {
    startTransition(async () => {
      setError(null)
      const res = await setBanFanzoneAction(user.id, val)
      if ('error' in res) setError(res.error)
      else setBanned(val)
    })
  }

  const handlePays = (val: boolean) => {
    startTransition(async () => {
      setError(null)
      const res = await setPaysEntryAction(user.id, val)
      if ('error' in res) setError(res.error)
      else setPays(val)
    })
  }

  return (
    <div
      className={cn(
        'glass-card rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-4',
        isPending && 'opacity-70',
      )}
    >
      {/* Avatar + info */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="w-10 h-10 rounded-full bg-[#571bc1] flex items-center justify-center font-heading font-bold text-sm text-white shrink-0">
          {getInitials(user.display_name)}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-heading font-bold text-white text-sm truncate">
              {user.display_name}
            </p>
            {user.is_admin && (
              <span className="font-mono text-[9px] font-bold uppercase tracking-widest bg-[#FF5E9F]/20 text-[#ffb0c9] px-1.5 py-0.5 rounded-full border border-[#FF5E9F]/30">
                Admin
              </span>
            )}
          </div>
          <p className="font-mono text-[10px] text-white/40">@{user.username}</p>
        </div>
      </div>

      {/* Controles */}
      <div className="flex flex-wrap items-center gap-3">

        {/* 💰 Porra con dinero */}
        <button
          type="button"
          onClick={() => handlePays(!pays)}
          disabled={isPending}
          title={pays ? 'Juega con dinero — clic para quitar' : 'No juega con dinero — clic para marcar'}
          className={cn(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-mono text-[11px] font-semibold transition-all',
            pays
              ? 'bg-[#00dce5]/15 border-[#00dce5]/40 text-[#00dce5]'
              : 'bg-white/5 border-white/10 text-white/40 hover:border-white/20 hover:text-white/60',
          )}
        >
          <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: pays ? "'FILL' 1" : "'FILL' 0" }}>
            payments
          </span>
          {pays ? 'Paga' : 'Sin pago'}
        </button>

        {/* 🚫 Veto Fan Zone */}
        <button
          type="button"
          onClick={() => handleBan(!banned)}
          disabled={isPending || user.is_admin}
          title={banned ? 'Vetado del Fan Zone — clic para permitir' : 'Acceso al Fan Zone — clic para vetar'}
          className={cn(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-mono text-[11px] font-semibold transition-all',
            banned
              ? 'bg-[#f87171]/15 border-[#f87171]/40 text-[#f87171]'
              : 'bg-white/5 border-white/10 text-white/40 hover:border-white/20 hover:text-white/60',
            user.is_admin && 'cursor-not-allowed opacity-40',
          )}
        >
          <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>
            {banned ? 'block' : 'check_circle'}
          </span>
          {banned ? 'Vetado' : 'Fan Zone OK'}
        </button>

        {/* ± Bonus points */}
        <div className="flex items-center gap-0 rounded-lg overflow-hidden border border-white/10 bg-[#1C1B2E]">
          {[-5, -1].map((delta) => (
            <button
              key={delta}
              type="button"
              onClick={() => handleBonus(delta)}
              disabled={isPending}
              className="px-2 py-1.5 font-mono text-[11px] font-bold text-[#f87171] hover:bg-white/5 transition-colors border-r border-white/10"
            >
              {delta}
            </button>
          ))}
          <span className={cn(
            'px-3 py-1.5 font-heading font-bold text-sm tabular-nums min-w-[3rem] text-center',
            bonus > 0 ? 'text-[#4ade80]' : bonus < 0 ? 'text-[#f87171]' : 'text-white/60',
          )}>
            {bonus > 0 ? `+${bonus}` : bonus}
          </span>
          {[+1, +5].map((delta) => (
            <button
              key={delta}
              type="button"
              onClick={() => handleBonus(delta)}
              disabled={isPending}
              className="px-2 py-1.5 font-mono text-[11px] font-bold text-[#4ade80] hover:bg-white/5 transition-colors border-l border-white/10"
            >
              +{delta}
            </button>
          ))}
        </div>
      </div>

      {/* Error */}
      {error && (
        <p className="w-full text-[11px] font-mono text-[#f87171]">⚠ {error}</p>
      )}
    </div>
  )
}

/* ── Componente principal ───────────────────────────────────── */
export function UsersClient({ users }: { users: AdminUser[] }) {
  const [search, setSearch] = useState('')

  const filtered = users.filter((u) =>
    u.display_name.toLowerCase().includes(search.toLowerCase()) ||
    u.username.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <div>
      {/* Barra de búsqueda */}
      <div className="mb-5 relative">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-white/30 text-[18px]">
          search
        </span>
        <input
          type="text"
          placeholder="Buscar usuario..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-xl bg-[#1C1B2E] border border-white/10 pl-9 pr-4 py-2.5 font-body text-sm text-white placeholder:text-white/30 outline-none focus:border-[#FF5E9F]/50 transition-colors"
        />
      </div>

      {/* Stats rápidas */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="glass-card rounded-xl p-3 text-center">
          <p className="font-heading font-bold text-xl text-white">{users.length}</p>
          <p className="font-mono text-[10px] text-white/40 uppercase">Total</p>
        </div>
        <div className="glass-card rounded-xl p-3 text-center">
          <p className="font-heading font-bold text-xl text-[#00dce5]">{users.filter((u) => u.pays_entry).length}</p>
          <p className="font-mono text-[10px] text-white/40 uppercase">Pagan</p>
        </div>
        <div className="glass-card rounded-xl p-3 text-center">
          <p className="font-heading font-bold text-xl text-[#f87171]">{users.filter((u) => u.is_banned_fanzone).length}</p>
          <p className="font-mono text-[10px] text-white/40 uppercase">Vetados</p>
        </div>
      </div>

      {/* Lista de usuarios */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <p className="text-center text-white/40 font-mono text-sm py-8">Sin resultados</p>
        ) : (
          filtered.map((user) => <UserRow key={user.id} user={user} />)
        )}
      </div>
    </div>
  )
}
