'use client'

/**
 * Formulario de predicciones especiales del torneo — Ultra-Strike Design.
 * Campeón, subcampeón, goleador, MVP, portero y joven.
 * Se bloquea 1 hora antes del partido inaugural (11 Jun 2026 21:00 UTC).
 */
import { useState } from 'react'
import { upsertSpecialPredictionsAction } from '../actions/predictions.actions'
import { areSpecialPredictionsLocked } from '../utils/prediction.utils'
import type { Tables } from '@/types/database.types'

type Team               = Tables<'teams'>
type SpecialPrediction  = Tables<'special_predictions'>

interface Props {
  teams:              Team[]
  initialPrediction:  SpecialPrediction | null
}

export function SpecialPredictionsForm({ teams, initialPrediction }: Props) {
  const locked = areSpecialPredictionsLocked()

  const [champion,    setChampion]    = useState(initialPrediction?.champion_team_id    ?? '')
  const [runnerUp,    setRunnerUp]    = useState(initialPrediction?.runner_up_team_id   ?? '')
  const [topScorer,   setTopScorer]   = useState(initialPrediction?.top_scorer          ?? '')
  const [mvp,         setMvp]         = useState(initialPrediction?.mvp                 ?? '')
  const [goalkeeper,  setGoalkeeper]  = useState(initialPrediction?.best_goalkeeper     ?? '')
  const [youngPlayer, setYoungPlayer] = useState(initialPrediction?.best_young_player   ?? '')

  const [isSaving, setIsSaving] = useState(false)
  const [saved,    setSaved]    = useState(!!initialPrediction)
  const [error,    setError]    = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setError(null)

    const result = await upsertSpecialPredictionsAction({
      champion_team_id:  champion   || null,
      runner_up_team_id: runnerUp   || null,
      top_scorer:        topScorer  || null,
      mvp:               mvp        || null,
      best_goalkeeper:   goalkeeper || null,
      best_young_player: youngPlayer || null,
    })

    setIsSaving(false)

    if ('error' in result) {
      setError(result.error)
    } else {
      setSaved(true)
    }
  }

  const sortedTeams = [...teams].sort((a, b) => a.name.localeCompare(b.name))

  return (
    <div className="mx-auto max-w-lg">
      {/* Cabecera */}
      <div className="mb-6 rounded-2xl border border-[#FF5E9F]/20 bg-[#FF5E9F]/8 p-4">
        <h2 className="font-heading text-lg font-bold uppercase tracking-wide text-[#FF5E9F]">
          ⭐ Predicciones Especiales
        </h2>
        <p className="mt-1 text-sm text-white/50">
          Se cierran 1 hora antes del partido inaugural — 11 Jun 2026, 21:00 UTC
        </p>
        {locked && (
          <p className="mt-2 text-sm font-semibold text-[#f87171]">
            🔒 Predicciones cerradas
          </p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Campeón */}
        <Field label="🏆 Campeón del Mundial" locked={locked}>
          <TeamSelect
            value={champion}
            onChange={setChampion}
            teams={sortedTeams}
            locked={locked}
            placeholder="Selecciona el campeón"
          />
        </Field>

        {/* Subcampeón */}
        <Field label="🥈 Subcampeón" locked={locked}>
          <TeamSelect
            value={runnerUp}
            onChange={setRunnerUp}
            teams={sortedTeams.filter(t => t.id !== champion)}
            locked={locked}
            placeholder="Selecciona el subcampeón"
          />
        </Field>

        <div className="border-t border-white/8 pt-5">
          <p className="mb-4 text-xs font-bold uppercase tracking-widest text-white/40">
            Premios Individuales
          </p>
          <div className="space-y-4">
            {/* Goleador */}
            <Field label="⚽ Máximo Goleador" locked={locked}>
              <PlayerInput
                value={topScorer}
                onChange={setTopScorer}
                locked={locked}
                placeholder="Nombre del jugador (ej: Mbappé)"
              />
            </Field>

            {/* MVP */}
            <Field label="⭐ Mejor Jugador (MVP)" locked={locked}>
              <PlayerInput
                value={mvp}
                onChange={setMvp}
                locked={locked}
                placeholder="Nombre del jugador (ej: Vinicius Jr.)"
              />
            </Field>

            {/* Portero */}
            <Field label="🧤 Mejor Portero" locked={locked}>
              <PlayerInput
                value={goalkeeper}
                onChange={setGoalkeeper}
                locked={locked}
                placeholder="Nombre del portero (ej: Courtois)"
              />
            </Field>

            {/* Joven */}
            <Field label="🌟 Mejor Jugador Joven" locked={locked}>
              <PlayerInput
                value={youngPlayer}
                onChange={setYoungPlayer}
                locked={locked}
                placeholder="Nombre del jugador (ej: Yamal)"
              />
            </Field>
          </div>
        </div>

        {/* Feedback */}
        {error && (
          <p className="rounded-xl border border-[#f87171]/30 bg-[#f87171]/8 px-4 py-2 text-sm text-[#f87171]">
            {error}
          </p>
        )}
        {saved && !error && (
          <p className="rounded-xl border border-[#4ade80]/30 bg-[#4ade80]/8 px-4 py-2 text-sm text-[#4ade80]">
            ✓ Predicciones especiales guardadas
          </p>
        )}

        {/* Botón */}
        {!locked && (
          <button
            type="submit"
            disabled={isSaving}
            className="w-full rounded-xl bg-[#FF5E9F] py-3 font-heading text-base font-bold uppercase tracking-widest text-white transition-all hover:bg-[#e0447f] hover:shadow-[0_0_20px_rgba(255,94,159,0.4)] disabled:opacity-50 active:scale-[0.98]"
          >
            {isSaving ? 'Guardando…' : 'Guardar Predicciones Especiales'}
          </button>
        )}
      </form>
    </div>
  )
}

// -----------------------------------------------
// Subcomponentes internos
// -----------------------------------------------
function Field({
  label,
  locked,
  children,
}: {
  label:    string
  locked:   boolean
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-semibold text-white/70">{label}</label>
      <div className={locked ? 'pointer-events-none opacity-50' : ''}>{children}</div>
    </div>
  )
}

function TeamSelect({
  value,
  onChange,
  teams,
  locked,
  placeholder,
}: {
  value:       string
  onChange:    (v: string) => void
  teams:       Tables<'teams'>[]
  locked:      boolean
  placeholder: string
}) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      disabled={locked}
      className="w-full rounded-xl border border-white/10 bg-white/6 px-4 py-2.5 text-sm text-white outline-none transition-all focus:border-[#FF5E9F]/60 focus:ring-2 focus:ring-[#FF5E9F]/20 disabled:cursor-not-allowed disabled:opacity-50 [&>option]:bg-[#1A1A2E] [&>option]:text-white"
    >
      <option value="" className="text-white/40">{placeholder}</option>
      {teams.map(team => (
        <option key={team.id} value={team.id}>
          {team.name}
        </option>
      ))}
    </select>
  )
}

function PlayerInput({
  value,
  onChange,
  locked,
  placeholder,
}: {
  value:       string
  onChange:    (v: string) => void
  locked:      boolean
  placeholder: string
}) {
  return (
    <input
      type="text"
      value={value}
      onChange={e => onChange(e.target.value)}
      disabled={locked}
      placeholder={placeholder}
      maxLength={100}
      className="w-full rounded-xl border border-white/10 bg-white/6 px-4 py-2.5 text-sm text-white placeholder:text-white/30 outline-none transition-all focus:border-[#FF5E9F]/60 focus:ring-2 focus:ring-[#FF5E9F]/20 disabled:cursor-not-allowed disabled:opacity-50"
    />
  )
}
