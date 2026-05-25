'use client'

/**
 * Admin Partidos — Client Component
 *
 * Por cada partido:
 *  • Mostrar equipos (nombre + código)
 *  • Inputs para home_score / away_score (0–20)
 *  • Selector de status (scheduled / live / finished / postponed)
 *  • Botón Guardar que llama updateMatchResultAction
 */
import { useState, useTransition } from 'react'
import { cn } from '@/lib/utils/cn'
import { updateMatchResultAction } from '@/features/admin/actions/admin.actions'

/* ── Tipos ──────────────────────────────────────────────────── */
export interface AdminMatch {
  id: string
  match_number: number
  stage: string
  scheduled_at: string
  status: string
  home_score: number | null
  away_score: number | null
  venue: string | null
  home_team: { id: string; name: string } | null
  away_team: { id: string; name: string } | null
}

const STATUS_OPTIONS = [
  { value: 'scheduled', label: 'Programado', color: 'text-white/50' },
  { value: 'live',      label: '🔴 En Vivo',  color: 'text-[#00dce5]' },
  { value: 'finished',  label: 'Finalizado',  color: 'text-[#4ade80]' },
  { value: 'postponed', label: 'Aplazado',    color: 'text-[#f87171]' },
]

const STAGE_LABELS: Record<string, string> = {
  GROUP:         'Fase de Grupos',
  ROUND_OF_16:   'Octavos de Final',
  QUARTER_FINAL: 'Cuartos de Final',
  SEMI_FINAL:    'Semifinales',
  THIRD_PLACE:   'Tercer y Cuarto Puesto',
  FINAL:         'Final',
}

/* ── MatchRow ───────────────────────────────────────────────── */
function MatchRow({ match }: { match: AdminMatch }) {
  const [homeScore, setHomeScore] = useState<string>(
    match.home_score !== null ? String(match.home_score) : '',
  )
  const [awayScore, setAwayScore] = useState<string>(
    match.away_score !== null ? String(match.away_score) : '',
  )
  const [status, setStatus] = useState(match.status)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const isDirty =
    homeScore !== (match.home_score !== null ? String(match.home_score) : '') ||
    awayScore !== (match.away_score !== null ? String(match.away_score) : '') ||
    status !== match.status

  const handleSave = () => {
    startTransition(async () => {
      setError(null)
      setSaved(false)
      const hs = homeScore.trim() !== '' ? parseInt(homeScore, 10) : null
      const as_ = awayScore.trim() !== '' ? parseInt(awayScore, 10) : null
      const res = await updateMatchResultAction(match.id, hs, as_, status)
      if ('error' in res) {
        setError(res.error)
      } else {
        setSaved(true)
        setTimeout(() => setSaved(false), 2000)
      }
    })
  }

  const matchDate = new Date(match.scheduled_at).toLocaleDateString('es-ES', {
    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
  })

  return (
    <div
      className={cn(
        'glass-card rounded-xl p-4 transition-opacity',
        isPending && 'opacity-60',
      )}
    >
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">

        {/* Partido info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-[10px] font-bold text-white/30 uppercase">
              #{match.match_number}
            </span>
            <span className="font-mono text-[10px] text-white/20">·</span>
            <span className="font-mono text-[10px] text-white/40">{matchDate}</span>
            {match.venue && (
              <>
                <span className="font-mono text-[10px] text-white/20">·</span>
                <span className="font-mono text-[10px] text-white/30 truncate">{match.venue}</span>
              </>
            )}
          </div>

          {/* Equipos */}
          <div className="flex items-center gap-3">
            <span className="font-heading font-semibold text-white text-sm">
              {match.home_team?.name ?? '—'}
            </span>
            <span className="text-white/30 font-mono text-xs">vs</span>
            <span className="font-heading font-semibold text-white text-sm">
              {match.away_team?.name ?? '—'}
            </span>
          </div>
        </div>

        {/* Controles */}
        <div className="flex flex-wrap items-center gap-3">

          {/* Scores */}
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={0}
              max={20}
              value={homeScore}
              onChange={(e) => setHomeScore(e.target.value)}
              placeholder="—"
              className="w-14 h-9 rounded-lg bg-[#1C1B2E] border border-white/10 text-center font-heading font-bold text-sm text-[#ffb0c9] outline-none focus:border-[#FF5E9F]/50 transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            <span className="text-white/30 font-mono text-xs">:</span>
            <input
              type="number"
              min={0}
              max={20}
              value={awayScore}
              onChange={(e) => setAwayScore(e.target.value)}
              placeholder="—"
              className="w-14 h-9 rounded-lg bg-[#1C1B2E] border border-white/10 text-center font-heading font-bold text-sm text-[#ffb0c9] outline-none focus:border-[#FF5E9F]/50 transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
          </div>

          {/* Status */}
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="h-9 rounded-lg bg-[#1C1B2E] border border-white/10 px-2 font-mono text-[11px] text-white/70 outline-none focus:border-[#FF5E9F]/50 transition-colors appearance-none cursor-pointer"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          {/* Guardar */}
          <button
            type="button"
            onClick={handleSave}
            disabled={isPending || !isDirty}
            className={cn(
              'h-9 px-4 rounded-lg font-mono text-[11px] font-bold uppercase tracking-wider transition-all',
              isDirty && !isPending
                ? 'bg-[#FF5E9F] text-white hover:bg-[#e0447f] active:scale-95'
                : 'bg-white/5 text-white/30 cursor-not-allowed',
            )}
          >
            {isPending ? '…' : saved ? '✓ OK' : 'Guardar'}
          </button>
        </div>

        {error && (
          <p className="w-full text-[11px] font-mono text-[#f87171] mt-1">⚠ {error}</p>
        )}
      </div>
    </div>
  )
}

/* ── Componente principal ───────────────────────────────────── */
export function MatchesClient({ matches }: { matches: AdminMatch[] }) {
  const [filterStage, setFilterStage] = useState('ALL')
  const [filterStatus, setFilterStatus] = useState('ALL')

  const stages = [...new Set(matches.map((m) => m.stage))]

  const filtered = matches.filter((m) => {
    if (filterStage !== 'ALL' && m.stage !== filterStage) return false
    if (filterStatus !== 'ALL' && m.status !== filterStatus) return false
    return true
  })

  /* Agrupar por stage */
  const grouped = filtered.reduce<Record<string, AdminMatch[]>>((acc, m) => {
    if (!acc[m.stage]) acc[m.stage] = []
    acc[m.stage].push(m)
    return acc
  }, {})

  return (
    <div>
      {/* Filtros */}
      <div className="mb-5 flex flex-wrap gap-3">
        <select
          value={filterStage}
          onChange={(e) => setFilterStage(e.target.value)}
          className="h-9 rounded-lg bg-[#1C1B2E] border border-white/10 px-3 font-mono text-[11px] text-white/70 outline-none"
        >
          <option value="ALL">Todas las fases</option>
          {stages.map((s) => (
            <option key={s} value={s}>{STAGE_LABELS[s] ?? s}</option>
          ))}
        </select>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="h-9 rounded-lg bg-[#1C1B2E] border border-white/10 px-3 font-mono text-[11px] text-white/70 outline-none"
        >
          <option value="ALL">Todos los estados</option>
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>

        <span className="ml-auto font-mono text-[11px] text-white/30 self-center">
          {filtered.length} partidos
        </span>
      </div>

      {/* Grupos por fase */}
      {Object.entries(grouped).map(([stage, stageMatches]) => (
        <section key={stage} className="mb-8">
          <h2 className="font-mono text-[11px] font-semibold uppercase tracking-widest text-white/40 mb-3 px-1">
            {STAGE_LABELS[stage] ?? stage} ({stageMatches.length})
          </h2>
          <div className="space-y-2">
            {stageMatches.map((m) => (
              <MatchRow key={m.id} match={m} />
            ))}
          </div>
        </section>
      ))}

      {filtered.length === 0 && (
        <p className="text-center text-white/40 font-mono text-sm py-12">Sin partidos</p>
      )}
    </div>
  )
}
