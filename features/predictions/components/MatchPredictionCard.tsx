'use client'

/**
 * Tarjeta de predicción de partido.
 *
 * • Guardado MANUAL — solo al pulsar el botón "Guardar predicción"
 * • Indicador grande verde cuando la predicción está guardada
 * • Inputs numéricos sin spinner
 */
import { useState } from 'react'
import { Flag } from '@/components/ui'
import { cn } from '@/lib/utils/cn'
import { upsertPredictionAction } from '../actions/predictions.actions'
import { isPredictionLocked } from '../utils/prediction.utils'
import type { MatchWithTeams } from '@/types/app.types'
import type { Tables } from '@/types/database.types'

type Prediction = Tables<'predictions'>
type SaveStatus  = 'idle' | 'saving' | 'saved' | 'error'

interface Props {
  match:      MatchWithTeams
  prediction: Prediction | null
  onPredictionSaved: (matchId: string, homeScore: number, awayScore: number) => void
}

export function MatchPredictionCard({ match, prediction, onPredictionSaved }: Props) {
  const locked = isPredictionLocked(match)

  const [homeScore, setHomeScore] = useState(prediction?.home_score ?? 0)
  const [awayScore, setAwayScore] = useState(prediction?.away_score ?? 0)
  // Valores guardados en DB (para detectar cambios sin guardar)
  const [savedHome, setSavedHome] = useState<number | null>(prediction?.home_score ?? null)
  const [savedAway, setSavedAway] = useState<number | null>(prediction?.away_score ?? null)
  const [status,    setStatus]    = useState<SaveStatus>(prediction ? 'saved' : 'idle')

  // Está "guardado" cuando el valor local coincide con lo que hay en DB
  const isSaved = savedHome !== null && savedHome === homeScore && savedAway === awayScore
  const topColor = isSaved ? 'from-[#FF5E9F]' : 'from-[#00dce5]/60'

  const handleSave = async () => {
    if (locked || status === 'saving') return
    setStatus('saving')
    const result = await upsertPredictionAction(match.id, homeScore, awayScore)
    if ('success' in result) {
      setSavedHome(homeScore)
      setSavedAway(awayScore)
      setStatus('saved')
      onPredictionSaved(match.id, homeScore, awayScore)
    } else {
      setStatus('error')
    }
  }

  return (
    <div className={cn(
      'glass-card rounded-2xl p-6 relative',
      locked && 'opacity-80 scale-[0.98]',
    )}>
      {/* Franja de color */}
      <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
        <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${topColor} to-transparent opacity-60`} />
      </div>

      {/* Equipos + marcador */}
      <div className="flex items-center justify-between mb-6">

        {/* Equipo local */}
        <div className="flex flex-col items-center flex-1">
          <div className={cn(
            'w-14 h-14 rounded-full bg-[#1E1E2E] flex items-center justify-center mb-2 shadow-inner border-2',
            isSaved ? 'border-[#FF5E9F]/20' : 'border-white/10',
          )}>
            <Flag
              countryCode={match.home_team?.country_code}
              alt={match.home_team?.name ?? 'Equipo local'}
              size={56}
              sourceWidth={80}
              className="rounded-full"
              imageClassName="rounded-full"
              fallbackClassName="rounded-full"
            />
          </div>
          <span className="font-heading text-sm font-semibold text-white text-center leading-tight">
            {match.home_team?.name ?? '?'}
          </span>
        </div>

        {/* Inputs de marcador */}
        <div className="flex items-center gap-3 px-4">
          {locked ? (
            <>
              <span className="w-12 h-14 flex items-center justify-center text-2xl font-heading font-bold text-white/50 bg-[#343344] rounded-xl">
                {homeScore}
              </span>
              <span className="text-white/40 font-mono text-sm">:</span>
              <span className="w-12 h-14 flex items-center justify-center text-2xl font-heading font-bold text-white/50 bg-[#343344] rounded-xl">
                {awayScore}
              </span>
            </>
          ) : (
            <>
              <input
                type="number"
                min={0}
                max={9}
                value={homeScore}
                onChange={(e) => {
                  const v = Math.min(9, Math.max(0, Number(e.target.value) || 0))
                  setHomeScore(v)
                  if (status === 'saved') setStatus('idle')
                }}
                className={cn(
                  'w-12 h-14 rounded-xl text-center text-2xl font-heading font-bold',
                  'bg-gradient-to-b from-[#3e3d52] to-[#2a2938] border-2 outline-none',
                  '[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none',
                  isSaved ? 'border-[#FF5E9F]/60 text-[#ffb0c9]' : 'border-white/10 text-white',
                )}
              />
              <span className="text-white/40 font-mono text-sm">:</span>
              <input
                type="number"
                min={0}
                max={9}
                value={awayScore}
                onChange={(e) => {
                  const v = Math.min(9, Math.max(0, Number(e.target.value) || 0))
                  setAwayScore(v)
                  if (status === 'saved') setStatus('idle')
                }}
                className={cn(
                  'w-12 h-14 rounded-xl text-center text-2xl font-heading font-bold',
                  'bg-gradient-to-b from-[#3e3d52] to-[#2a2938] border-2 outline-none',
                  '[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none',
                  isSaved ? 'border-[#FF5E9F]/60 text-[#ffb0c9]' : 'border-white/10 text-white',
                )}
              />
            </>
          )}
        </div>

        {/* Equipo visitante */}
        <div className="flex flex-col items-center flex-1">
          <div className="w-14 h-14 rounded-full bg-[#1E1E2E] border-2 border-white/10 flex items-center justify-center mb-2 shadow-inner">
            <Flag
              countryCode={match.away_team?.country_code}
              alt={match.away_team?.name ?? 'Equipo visitante'}
              size={56}
              sourceWidth={80}
              className="rounded-full"
              imageClassName="rounded-full"
              fallbackClassName="rounded-full"
            />
          </div>
          <span className="font-heading text-sm font-semibold text-white text-center leading-tight">
            {match.away_team?.name ?? '?'}
          </span>
        </div>
      </div>

      {/* Badge estadio */}
      <div className="flex justify-center mb-4">
        <div className="bg-[#1A1A2A] px-4 py-1 rounded-full border border-white/5">
          <span className="font-mono text-[10px] font-semibold text-[#00dce5] tracking-widest uppercase">
            {match.venue ?? 'Estadio por confirmar'}
          </span>
        </div>
      </div>

      {/* Zona de guardado */}
      {locked ? (
        <div className="flex items-center justify-center gap-2 py-2 text-xs text-white/30">
          <span>🔒</span>
          <span className="font-mono">Predicción cerrada</span>
        </div>
      ) : isSaved ? (
        <div className="flex items-center justify-center gap-2 py-3 rounded-xl bg-[#4ade80]/10 border border-[#4ade80]/20">
          <span
            className="material-symbols-outlined text-[#4ade80] text-[20px]"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            check_circle
          </span>
          <span className="font-heading font-semibold text-[#4ade80] text-sm">
            Predicción guardada
          </span>
        </div>
      ) : (
        <div className="flex flex-col gap-1.5">
          <button
            type="button"
            onClick={handleSave}
            disabled={status === 'saving'}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#FF5E9F] text-white font-heading font-bold text-sm shadow-[0_3px_0_#b21e64] transition-all active:translate-y-[2px] active:shadow-none disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="material-symbols-outlined text-[18px]">
              {status === 'saving' ? 'hourglass_empty' : 'save'}
            </span>
            {status === 'saving' ? 'Guardando…' : 'Guardar predicción'}
          </button>
          {status === 'error' && (
            <p className="text-center font-mono text-[11px] text-[#f87171]">
              Error al guardar — inténtalo de nuevo
            </p>
          )}
        </div>
      )}
    </div>
  )
}
