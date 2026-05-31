'use client'

/**
 * SpecialsClient — diseño Stitch exacto.
 * Bento grid 2 columnas:
 *   • Máximo Goleador (full width) — texto libre + chips de jugadores estrella
 *   • Guante de Oro (mitad)
 *   • Finalistas (mitad)
 *   • Campeón (full width) — con trofeo decorativo
 * Botón "Bloquear Predicciones" al final.
 */
import { useState } from 'react'
import { cn } from '@/lib/utils/cn'
import { upsertSpecialPredictionsAction } from '@/features/predictions/actions/predictions.actions'
import { areSpecialPredictionsLocked }    from '@/features/predictions/utils/prediction.utils'
import type { Tables } from '@/types/database.types'

type Team              = Tables<'teams'>
type SpecialPrediction = Tables<'special_predictions'>

interface WorldPlayer {
  id:       string
  name:     string
  position: string
  team_id:  string
}

const STAR_PLAYERS = ['Kylian Mbappé', 'Erling Haaland', 'Vinicius Jr', 'Lionel Messi', 'Jude Bellingham', 'Lamine Yamal']
const STAR_ASSIST_PLAYERS = ['Lamine Yamal', 'Jude Bellingham', 'Bruno Fernandes', 'Pedri', 'Jamal Musiala', 'Kevin De Bruyne']

function PlayerAutocomplete({
  value,
  onChange,
  players,
  placeholder,
  disabled,
  accentColor = '#FF5E9F',
}: {
  value:       string
  onChange:    (v: string) => void
  players:     WorldPlayer[]
  placeholder: string
  disabled:    boolean
  accentColor?: string
}) {
  const [open, setOpen] = useState(false)

  const matches = value.trim().length > 0
    ? players
        .filter(p => p.name.toLowerCase().includes(value.toLowerCase()))
        .slice(0, 8)
    : []

  return (
    <div className="relative">
      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none">search</span>
      <input
        type="text"
        value={value}
        onChange={e => { onChange(e.target.value); setOpen(true) }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        disabled={disabled}
        placeholder={placeholder}
        className="w-full bg-[#1E1E2E] border-none rounded-lg py-3 pl-10 pr-4 text-white font-body focus:ring-2 outline-none transition-all placeholder:text-white/30 disabled:opacity-50"
        style={{ '--tw-ring-color': accentColor } as React.CSSProperties}
      />
      {open && matches.length > 0 && (
        <div className="absolute z-50 left-0 right-0 top-full mt-1 overflow-hidden rounded-lg border border-white/10 bg-[#1A1A2E] shadow-2xl max-h-56 overflow-y-auto">
          {matches.map(player => (
            <button
              key={player.id}
              type="button"
              onMouseDown={() => { onChange(player.name); setOpen(false) }}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-white/5"
            >
              <span className={cn(
                'shrink-0 rounded px-1.5 py-0.5 font-mono text-[10px] font-bold',
                player.position === 'GK'  ? 'bg-[#f59e0b]/20 text-[#f59e0b]'  :
                player.position === 'DEF' ? 'bg-[#3b82f6]/20 text-[#3b82f6]'  :
                player.position === 'MID' ? 'bg-[#00dce5]/20 text-[#00dce5]'  :
                                            'bg-[#FF5E9F]/20 text-[#FF5E9F]',
              )}>
                {player.position}
              </span>
              <span className="flex-1 truncate text-sm text-white font-body">{player.name}</span>
              <span className="shrink-0 font-mono text-[10px] text-white/40">{player.team_id}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
const MOCK_TOP_SCORERS = [
  { name: 'K. Mbappé', stat: 5, team: 'FRA' },
  { name: 'E. Haaland', stat: 4, team: 'NOR' },
  { name: 'Vini Jr.', stat: 4, team: 'BRA' },
  { name: 'L. Yamal', stat: 3, team: 'ESP' },
]
const MOCK_TOP_ASSISTS = [
  { name: 'L. Yamal', stat: 4, team: 'ESP' },
  { name: 'K. De Bruyne', stat: 3, team: 'BEL' },
  { name: 'Pedri', stat: 3, team: 'ESP' },
  { name: 'B. Fernandes', stat: 2, team: 'POR' },
]

interface Props {
  initialPrediction: SpecialPrediction | null
  teams:             Team[]
  players:           WorldPlayer[]
}

export function SpecialsClient({ initialPrediction, teams, players }: Props) {
  const locked = areSpecialPredictionsLocked()

  const [topScorer,   setTopScorer]   = useState(initialPrediction?.top_scorer         ?? '')
  const [topAssist,   setTopAssist]   = useState(initialPrediction?.top_assist_player  ?? '')
  const [goalkeeper,  setGoalkeeper]  = useState(initialPrediction?.best_goalkeeper    ?? '')
  const [champion,    setChampion]    = useState(initialPrediction?.champion_team_id   ?? '')
  const [runnerUp,    setRunnerUp]    = useState(initialPrediction?.runner_up_team_id  ?? '')

  const [isSaving, setIsSaving] = useState(false)
  const [saved,    setSaved]    = useState(!!initialPrediction)
  const [error,    setError]    = useState<string | null>(null)

  const sortedTeams = [...teams].sort((a, b) => a.name.localeCompare(b.name))

  const handleSave = async () => {
    if (locked) return
    setIsSaving(true)
    setError(null)
    const result = await upsertSpecialPredictionsAction({
      champion_team_id:  champion   || null,
      runner_up_team_id: runnerUp   || null,
      top_scorer:        topScorer  || null,
      top_assist_player: topAssist  || null,
      mvp:               null,
      best_goalkeeper:   goalkeeper || null,
      best_young_player: null,
    })
    setIsSaving(false)
    if ('error' in result) { setError(result.error) }
    else { setSaved(true) }
  }

  return (
    <div className="px-4 pt-6 pb-32 max-w-4xl mx-auto">

      {/* Heading */}
      <div className="mb-8">
        <h2 className="font-heading text-[28px] font-bold text-white mb-1">
          Predicciones Especiales
        </h2>
        <p className="font-body text-white/60">
          Define el destino del torneo y demuestra tu conocimiento.
        </p>
      </div>

      {/* Bento grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

        {/* ── Máximo Goleador (full width) ────────────────────── */}
        <section className="glass-card rounded-xl p-5 md:col-span-2">
          <h3 className="font-heading text-xl font-semibold text-[#ffb0c9] flex flex-wrap items-center gap-2 mb-4">
            <span className="material-symbols-outlined text-[20px]"
              style={{ fontVariationSettings: "'FILL' 1" }}>workspace_premium</span>
            Máximo Goleador
            <span className="font-mono text-[11px] font-bold px-2 py-1 bg-[#FF5E9F]/20 text-[#ffb0c9] rounded border border-[#ffb0c9]/30 tracking-widest">
              BOTA DE ORO
            </span>
          </h3>

          <div className="mb-4">
            <PlayerAutocomplete
              value={topScorer}
              onChange={setTopScorer}
              players={players}
              placeholder="Buscar jugador..."
              disabled={locked}
              accentColor="#FF5E9F"
            />
          </div>

          {/* Chips de jugadores estrella */}
          <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
            {STAR_PLAYERS.map(player => (
              <button
                key={player}
                type="button"
                disabled={locked}
                onClick={() => setTopScorer(player)}
                className={cn(
                  'flex-shrink-0 flex flex-col items-center gap-1 group/p',
                  locked && 'opacity-50 cursor-not-allowed',
                )}
              >
                <div className={cn(
                  'w-16 h-16 rounded-full border-2 flex items-center justify-center font-heading font-black text-white text-sm bg-[#292839] transition-all',
                  topScorer === player
                    ? 'border-[#FF5E9F] shadow-[0_0_12px_rgba(255,94,159,0.4)]'
                    : 'border-white/10 opacity-60 group-hover/p:opacity-100',
                )}>
                  {player.split(' ').map(w => w[0]).join('').slice(0, 2)}
                </div>
                <p className="font-mono text-[11px] text-center text-white/70 w-16 truncate">
                  {player}
                </p>
              </button>
            ))}
          </div>
        </section>

        {/* ── Máximo Asistente (full width) ─────────────────────── */}
        <section className="glass-card rounded-xl p-5 md:col-span-2">
          <h3 className="font-heading text-xl font-semibold text-[#8be9fd] flex flex-wrap items-center gap-2 mb-4">
            <span
              className="material-symbols-outlined text-[20px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              bolt
            </span>
            Máximo Asistente
            <span className="font-mono text-[11px] font-bold px-2 py-1 bg-[#00dce5]/20 text-[#8be9fd] rounded border border-[#8be9fd]/30 tracking-widest">
              ÚLTIMO PASE
            </span>
          </h3>

          <div className="mb-4">
            <PlayerAutocomplete
              value={topAssist}
              onChange={setTopAssist}
              players={players}
              placeholder="Buscar asistente..."
              disabled={locked}
              accentColor="#00dce5"
            />
          </div>

          <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
            {STAR_ASSIST_PLAYERS.map(player => (
              <button
                key={player}
                type="button"
                disabled={locked}
                onClick={() => setTopAssist(player)}
                className={cn(
                  'flex-shrink-0 flex flex-col items-center gap-1 group/p',
                  locked && 'opacity-50 cursor-not-allowed',
                )}
              >
                <div className={cn(
                  'w-16 h-16 rounded-full border-2 flex items-center justify-center font-heading font-black text-white text-sm bg-[#292839] transition-all',
                  topAssist === player
                    ? 'border-[#00dce5] shadow-[0_0_12px_rgba(0,220,229,0.4)]'
                    : 'border-white/10 opacity-60 group-hover/p:opacity-100',
                )}>
                  {player.split(' ').map(w => w[0]).join('').slice(0, 2)}
                </div>
                <p className="font-mono text-[11px] text-center text-white/70 w-16 truncate">
                  {player}
                </p>
              </button>
            ))}
          </div>
        </section>

        {/* ── Guante de Oro ──────────────────────────────────── */}
        <section className="glass-card rounded-xl p-5 flex flex-col items-center text-center group">
          <div className="w-16 h-16 rounded-full bg-[#00dce5]/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <span className="material-symbols-outlined text-[#00dce5] text-[40px]"
              style={{ fontVariationSettings: "'FILL' 1" }}>front_hand</span>
          </div>
          <h3 className="font-heading text-2xl font-semibold text-white mb-2">Guante de Oro</h3>
          <p className="font-body text-white/60 mb-6 text-sm">El portero con más porterías a cero.</p>

          <PlayerAutocomplete
            value={goalkeeper}
            onChange={setGoalkeeper}
            players={players.filter(p => p.position === 'GK')}
            placeholder="Buscar portero..."
            disabled={locked}
            accentColor="#00dce5"
          />
        </section>

        {/* ── Finalistas ─────────────────────────────────────── */}
        <section className="glass-card rounded-xl p-5 flex flex-col group">
          <h3 className="font-heading text-2xl font-semibold text-white mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-[#d0bcff]">stadium</span>
            Finalistas
          </h3>
          <div className="grid grid-cols-2 gap-4 flex-1">
            {/* Equipo 1 (campeón) */}
            <select
              value={champion}
              onChange={e => setChampion(e.target.value)}
              disabled={locked}
              className="flex flex-col items-center justify-center rounded-lg p-3 text-white font-body text-sm border border-dashed border-white/30 hover:border-[#ffb0c9] bg-transparent focus:outline-none focus:border-[#ffb0c9] transition-colors cursor-pointer disabled:opacity-50 [&>option]:bg-[#1A1A2E] [&>option]:text-white"
            >
              <option value="">EQUIPO 1</option>
              {sortedTeams.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>

            {/* Equipo 2 (subcampeón) */}
            <select
              value={runnerUp}
              onChange={e => setRunnerUp(e.target.value)}
              disabled={locked}
              className="flex flex-col items-center justify-center rounded-lg p-3 text-white font-body text-sm border border-dashed border-white/30 hover:border-[#ffb0c9] bg-transparent focus:outline-none focus:border-[#ffb0c9] transition-colors cursor-pointer disabled:opacity-50 [&>option]:bg-[#1A1A2E] [&>option]:text-white"
            >
              <option value="">EQUIPO 2</option>
              {sortedTeams.filter(t => t.id !== champion).map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>
        </section>

        {/* ── Campeón (full width) ────────────────────────────── */}
        <section className="glass-card rounded-xl p-5 md:col-span-2 bg-gradient-to-br from-[#1E1E2E] to-[#FF5E9F]/5 border-[#FF5E9F]/20 relative group overflow-hidden">
          <div className="absolute -right-10 -bottom-10 opacity-5 group-hover:scale-110 transition-transform duration-700 pointer-events-none">
            <span className="material-symbols-outlined text-[#ffb0c9] text-[200px]"
              style={{ fontVariationSettings: "'FILL' 1" }}>emoji_events</span>
          </div>
          <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
            <div className="flex-1 text-center md:text-left">
              <h3 className="font-heading text-4xl md:text-5xl font-black text-[#ffb0c9] mb-2">
                Campeón
              </h3>
              <p className="font-body text-white/60 mb-6">
                Elige quién levantará la Copa en el MetLife Stadium.
              </p>

              <select
                value={champion}
                onChange={e => setChampion(e.target.value)}
                disabled={locked}
                className="w-full md:w-auto bg-[#FF5E9F] hover:bg-[#e0447f] text-white font-heading font-bold px-8 py-4 rounded-xl shadow-[0px_4px_0px_#8e004b] cursor-pointer outline-none transition-all text-base flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed [&>option]:bg-[#1A1A2E] [&>option]:text-white"
              >
                <option value="">ELEGIR CAMPEÓN</option>
                {sortedTeams.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>

            {/* Trofeo decorativo (emoji gigante) */}
            <div className="flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-[#FF5E9F]/20 blur-3xl rounded-full" />
                <span className="relative z-10 text-[120px] leading-none drop-shadow-2xl">🏆</span>
              </div>
            </div>
          </div>
        </section>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">
        <section className="glass-card rounded-xl p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-heading text-2xl font-semibold text-[#ffb0c9]">Tabla de Goleadores</h3>
            <span className="font-mono text-[10px] uppercase tracking-widest text-white/40">Mock data</span>
          </div>
          <div className="space-y-2">
            {MOCK_TOP_SCORERS.map((player, index) => (
              <div
                key={`${player.team}-${player.name}`}
                className="grid grid-cols-[32px_1fr_auto] items-center gap-3 rounded-lg border border-white/5 bg-[#1E1E2E]/70 px-3 py-2"
              >
                <span className="font-mono text-[12px] text-white/50">{index + 1}</span>
                <div className="min-w-0">
                  <p className="truncate font-body text-sm text-white">{player.name}</p>
                  <p className="font-mono text-[10px] uppercase tracking-widest text-white/35">{player.team}</p>
                </div>
                <span className="font-heading text-lg font-bold text-[#ffb0c9]">{player.stat}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="glass-card rounded-xl p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-heading text-2xl font-semibold text-[#8be9fd]">Tabla de Asistentes</h3>
            <span className="font-mono text-[10px] uppercase tracking-widest text-white/40">Mock data</span>
          </div>
          <div className="space-y-2">
            {MOCK_TOP_ASSISTS.map((player, index) => (
              <div
                key={`${player.team}-${player.name}`}
                className="grid grid-cols-[32px_1fr_auto] items-center gap-3 rounded-lg border border-white/5 bg-[#1E1E2E]/70 px-3 py-2"
              >
                <span className="font-mono text-[12px] text-white/50">{index + 1}</span>
                <div className="min-w-0">
                  <p className="truncate font-body text-sm text-white">{player.name}</p>
                  <p className="font-mono text-[10px] uppercase tracking-widest text-white/35">{player.team}</p>
                </div>
                <span className="font-heading text-lg font-bold text-[#8be9fd]">{player.stat}</span>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Feedback */}
      {error && (
        <p className="mt-6 rounded-xl border border-[#f87171]/30 bg-[#f87171]/8 px-4 py-2 text-sm text-[#f87171]">
          {error}
        </p>
      )}

      {/* Botón bloquear */}
      <div className="mt-8 flex flex-col items-center gap-4">
        {locked || saved ? (
          <div className="flex flex-col items-center gap-2">
            <span className="material-symbols-outlined text-[32px] text-[#4ade80]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
            <p className="font-mono text-[13px] font-semibold text-[#4ade80] flex items-center gap-2">
              <span className="material-symbols-outlined text-[14px]">lock</span>
              {locked ? 'Predicciones cerradas' : 'Predicciones ya guardadas'}
            </p>
            {saved && !locked && (
              <p className="font-mono text-[11px] text-white/40 text-center">
                No puedes modificarlas una vez guardadas.
              </p>
            )}
          </div>
        ) : (
          <>
            <p className="font-mono text-[11px] text-[#f87171] flex items-center gap-2">
              <span className="material-symbols-outlined text-[14px]">info</span>
              Una vez guardado no podrás editar tus predicciones.
            </p>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="w-full py-5 bg-[#383848] border border-white/10 rounded-full font-heading font-bold text-white hover:bg-[#343344] transition-colors flex items-center justify-center gap-3 group relative overflow-hidden active:scale-[0.98] disabled:opacity-50"
            >
              <span className="material-symbols-outlined group-hover:rotate-12 transition-transform">lock</span>
              {isSaving ? 'Guardando…' : 'Bloquear Predicciones'}
            </button>
          </>
        )}
      </div>
    </div>
  )
}
