'use client'

import { useState, useTransition } from 'react'
import { cn } from '@/lib/utils/cn'
import {
  updateMatchResultAction,
  syncMatchFromApiAction,
  setMatchExternalIdAction,
  mapAllFixturesAction,
} from '@/features/admin/actions/admin.actions'

/* ── Tipos ──────────────────────────────────────────────────────── */
export interface AdminMatch {
  id: string
  match_number: number
  stage: string
  scheduled_at: string
  status: string
  home_score: number | null
  away_score: number | null
  venue: string | null
  external_fixture_id: number | null
  home_team: { id: string; name: string } | null
  away_team: { id: string; name: string } | null
}

const STATUS_OPTIONS = [
  { value: 'scheduled', label: 'Programado',  color: 'text-white/50' },
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

/* ── MatchRow ───────────────────────────────────────────────────── */
function MatchRow({ match }: { match: AdminMatch }) {
  const [homeScore, setHomeScore] = useState<string>(
    match.home_score !== null ? String(match.home_score) : '',
  )
  const [awayScore, setAwayScore] = useState<string>(
    match.away_score !== null ? String(match.away_score) : '',
  )
  const [status, setStatus] = useState(match.status)
  const [externalId, setExternalId] = useState<string>(
    match.external_fixture_id !== null ? String(match.external_fixture_id) : '',
  )
  const [showIdEditor, setShowIdEditor] = useState(false)
  const [saved, setSaved] = useState(false)
  const [syncMsg, setSyncMsg] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const isDirty =
    homeScore !== (match.home_score !== null ? String(match.home_score) : '') ||
    awayScore !== (match.away_score !== null ? String(match.away_score) : '') ||
    status !== match.status

  const hasExternalId = externalId.trim() !== ''

  const handleSave = () => {
    startTransition(async () => {
      setError(null)
      setSaved(false)
      const hs = homeScore.trim() !== '' ? parseInt(homeScore, 10) : null
      const as_ = awayScore.trim() !== '' ? parseInt(awayScore, 10) : null
      const res = await updateMatchResultAction(match.id, hs, as_, status)
      if ('error' in res) setError(res.error)
      else {
        setSaved(true)
        setTimeout(() => setSaved(false), 2000)
      }
    })
  }

  const handleSync = () => {
    startTransition(async () => {
      setError(null)
      setSyncMsg(null)
      const res = await syncMatchFromApiAction(match.id)
      if ('error' in res) setError(res.error)
      else {
        setSyncMsg(res.message)
        setTimeout(() => setSyncMsg(null), 4000)
      }
    })
  }

  const handleSaveExternalId = () => {
    const numId = parseInt(externalId.trim(), 10)
    if (!numId || isNaN(numId)) { setError('ID inválido'); return }
    startTransition(async () => {
      setError(null)
      const res = await setMatchExternalIdAction(match.id, numId)
      if ('error' in res) setError(res.error)
      else setShowIdEditor(false)
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
          <div className="flex items-center gap-2 mb-1 flex-wrap">
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

            {/* Badge external ID */}
            <button
              type="button"
              onClick={() => setShowIdEditor(!showIdEditor)}
              className={cn(
                'font-mono text-[9px] px-1.5 py-0.5 rounded border transition-colors',
                hasExternalId
                  ? 'border-[#8B5CF6]/40 text-[#8B5CF6] hover:border-[#8B5CF6]/70'
                  : 'border-white/10 text-white/20 hover:border-white/30 hover:text-white/40',
              )}
              title={hasExternalId ? `Fixture ID: ${externalId} (click para editar)` : 'Sin ID externo (click para asignar)'}
            >
              {hasExternalId ? `🔗 ${externalId}` : '+ ID ext'}
            </button>
          </div>

          {/* Editor de external ID */}
          {showIdEditor && (
            <div className="flex items-center gap-2 mb-2">
              <input
                type="number"
                value={externalId}
                onChange={(e) => setExternalId(e.target.value)}
                placeholder="Fixture ID de API-Football"
                className="h-7 w-40 rounded-lg bg-[#1C1B2E] border border-[#8B5CF6]/40 px-2 font-mono text-[10px] text-white/70 outline-none focus:border-[#8B5CF6]/70"
              />
              <button
                type="button"
                onClick={handleSaveExternalId}
                disabled={isPending}
                className="h-7 px-3 rounded-lg bg-[#8B5CF6] text-white font-mono text-[10px] hover:bg-[#7c3aed] transition-colors"
              >
                Guardar
              </button>
              <button
                type="button"
                onClick={() => { setShowIdEditor(false); setExternalId(match.external_fixture_id !== null ? String(match.external_fixture_id) : '') }}
                className="h-7 px-2 rounded-lg bg-white/5 text-white/40 font-mono text-[10px] hover:bg-white/10 transition-colors"
              >
                ✕
              </button>
            </div>
          )}

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

          {/* Guardar manual */}
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

          {/* Sync desde API */}
          <button
            type="button"
            onClick={handleSync}
            disabled={isPending || !hasExternalId}
            title={hasExternalId ? 'Sincronizar desde API-Football' : 'Asigna un ID externo primero'}
            className={cn(
              'h-9 px-3 rounded-lg font-mono text-[11px] font-bold transition-all',
              hasExternalId && !isPending
                ? 'bg-[#8B5CF6]/20 text-[#8B5CF6] border border-[#8B5CF6]/30 hover:bg-[#8B5CF6]/30 active:scale-95'
                : 'bg-white/5 text-white/20 border border-white/5 cursor-not-allowed',
            )}
          >
            {isPending ? '…' : '↻ Sync'}
          </button>
        </div>

        {/* Mensajes */}
        {error && (
          <p className="w-full text-[11px] font-mono text-[#f87171] mt-1">⚠ {error}</p>
        )}
        {syncMsg && (
          <p className="w-full text-[11px] font-mono text-[#8B5CF6] mt-1">✓ {syncMsg}</p>
        )}
      </div>
    </div>
  )
}

/* ── Botón global "Mapear todos" ─────────────────────────────────── */
function MapAllButton() {
  const [isPending, startTransition] = useTransition()
  const [result, setResult] = useState<string | null>(null)

  const handleMap = () => {
    startTransition(async () => {
      setResult(null)
      const res = await mapAllFixturesAction()
      if ('error' in res) {
        setResult(`⚠ ${res.error}`)
      } else {
        setResult(`✓ Mapeados: ${res.mapped} · Ya tenían ID: ${res.skipped} · Sin match: ${res.unmatched}`)
      }
    })
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={handleMap}
        disabled={isPending}
        className="h-9 px-4 rounded-lg bg-[#8B5CF6]/20 border border-[#8B5CF6]/30 text-[#8B5CF6] font-mono text-[11px] font-bold hover:bg-[#8B5CF6]/30 active:scale-95 transition-all disabled:opacity-50"
      >
        {isPending ? 'Mapeando…' : '🗺 Mapear desde API-Football'}
      </button>
      {result && (
        <p className="font-mono text-[10px] text-white/50">{result}</p>
      )}
    </div>
  )
}

/* ── Componente principal ─────────────────────────────────────────── */
export function MatchesClient({ matches }: { matches: AdminMatch[] }) {
  const [filterStage, setFilterStage] = useState('ALL')
  const [filterStatus, setFilterStatus] = useState('ALL')

  const stages = [...new Set(matches.map((m) => m.stage))]

  const filtered = matches.filter((m) => {
    if (filterStage !== 'ALL' && m.stage !== filterStage) return false
    if (filterStatus !== 'ALL' && m.status !== filterStatus) return false
    return true
  })

  const grouped = filtered.reduce<Record<string, AdminMatch[]>>((acc, m) => {
    if (!acc[m.stage]) acc[m.stage] = []
    acc[m.stage].push(m)
    return acc
  }, {})

  const withId = matches.filter((m) => m.external_fixture_id !== null).length

  return (
    <div>
      {/* Filtros + Mapear */}
      <div className="mb-5 flex flex-wrap gap-3 items-center">
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

        <span className="font-mono text-[11px] text-white/30">
          {filtered.length} partidos · {withId}/{matches.length} con ID externo
        </span>

        <div className="ml-auto">
          <MapAllButton />
        </div>
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
