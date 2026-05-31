'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { Flag } from '@/components/ui'
import { formatMatchDate } from '@/lib/utils/dates'
import { cn } from '@/lib/utils/cn'
import {
  clearKnockoutPredictionAction,
  upsertKnockoutPredictionAction,
} from '../actions/predictions.actions'
import {
  getKnockoutMatchLabel,
  getKnockoutOptions,
  getKnockoutSourceLabel,
  getKnockoutStageLabel,
  isPredictionLocked,
  KNOCKOUT_STAGE_ORDER,
} from '../utils/prediction.utils'
import type { MatchWithTeams } from '@/types/app.types'
import type { Tables } from '@/types/database.types'

type KnockoutPrediction = Tables<'knockout_predictions'>
type Team = Tables<'teams'>
type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

interface Props {
  matches: MatchWithTeams[]
  predictions: KnockoutPrediction[]
  teams: Team[]
}

export function KnockoutPredictions({ matches, predictions, teams }: Props) {
  const sortedMatches = useMemo(
    () => [...matches].sort((a, b) => a.match_number - b.match_number),
    [matches]
  )

  const [winnerByMatchId, setWinnerByMatchId] = useState<Record<string, string>>(
    () => Object.fromEntries(predictions.map((prediction) => [prediction.match_id, prediction.winner_team_id]))
  )
  const [scoreAfter120ByMatchId, setScoreAfter120ByMatchId] = useState<
    Record<string, { home: string; away: string }>
  >(
    () =>
      Object.fromEntries(
        predictions.map((prediction) => [
          prediction.match_id,
          {
            home:
              prediction.home_score_after_120 !== null
                ? String(prediction.home_score_after_120)
                : '',
            away:
              prediction.away_score_after_120 !== null
                ? String(prediction.away_score_after_120)
                : '',
          },
        ])
      )
  )
  const [statusByMatchId, setStatusByMatchId] = useState<Record<string, SaveStatus>>(
    () =>
      Object.fromEntries(
        sortedMatches.map((match) => [
          match.id,
          predictions.some((item) => item.match_id === match.id) ? 'saved' : 'idle',
        ])
      )
  )

  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map())

  useEffect(() => {
    const timers = timersRef.current
    return () => {
      timers.forEach((timer) => clearTimeout(timer))
      timers.clear()
    }
  }, [])

  const predictionByMatchNumber = useMemo(
    () => buildPredictionByMatchNumber(sortedMatches, winnerByMatchId),
    [sortedMatches, winnerByMatchId]
  )

  const queueSave = (
    matchId: string,
    winnerTeamId: string,
    scoreAfter120 = scoreAfter120ByMatchId[matchId]
  ) => {
    cancelScheduledSave(matchId)
    timersRef.current.set(
      matchId,
      setTimeout(async () => {
        setStatusByMatchId((current) => ({ ...current, [matchId]: 'saving' }))
        const result = await upsertKnockoutPredictionAction(
          matchId,
          winnerTeamId,
          parseNullableScore(scoreAfter120?.home),
          parseNullableScore(scoreAfter120?.away)
        )
        setStatusByMatchId((current) => ({
          ...current,
          [matchId]: 'success' in result ? 'saved' : 'error',
        }))
      }, 800)
    )
  }

  const handlePickChange = (matchId: string, winnerTeamId: string) => {
    const nextState = { ...winnerByMatchId, [matchId]: winnerTeamId }
    const { record, clearedMatchIds } = pruneInvalidDescendants({
      matches: sortedMatches,
      teams,
      winnerByMatchId: nextState,
    })

    setWinnerByMatchId(record)
    setStatusByMatchId((current) => ({
      ...current,
      [matchId]: 'idle',
      ...Object.fromEntries(clearedMatchIds.map((id) => [id, 'idle' as const])),
    }))

    queueSave(matchId, winnerTeamId)
    clearedMatchIds.forEach((clearedMatchId) => {
      cancelScheduledSave(clearedMatchId)
      void clearKnockoutPredictionAction(clearedMatchId)
    })
  }

  const handleScoreAfter120Change = (
    matchId: string,
    side: 'home' | 'away',
    value: string
  ) => {
    const nextScore = {
      home: side === 'home' ? value : scoreAfter120ByMatchId[matchId]?.home ?? '',
      away: side === 'away' ? value : scoreAfter120ByMatchId[matchId]?.away ?? '',
    }

    setScoreAfter120ByMatchId((current) => ({
      ...current,
      [matchId]: nextScore,
    }))
    setStatusByMatchId((current) => ({ ...current, [matchId]: 'idle' }))

    const winnerTeamId = winnerByMatchId[matchId]
    if (winnerTeamId) {
      queueSave(matchId, winnerTeamId, nextScore)
    }
  }

  const handleClear = (matchId: string) => {
    const nextState = { ...winnerByMatchId }
    delete nextState[matchId]

    const { record, clearedMatchIds } = pruneInvalidDescendants({
      matches: sortedMatches,
      teams,
      winnerByMatchId: nextState,
    })
    const allCleared = [matchId, ...clearedMatchIds]

    setWinnerByMatchId(record)
    setScoreAfter120ByMatchId((current) => {
      const next = { ...current }
      allCleared.forEach((clearedMatchId) => {
        delete next[clearedMatchId]
      })
      return next
    })
    setStatusByMatchId((current) => ({
      ...current,
      ...Object.fromEntries(allCleared.map((id) => [id, 'idle' as const])),
    }))

    allCleared.forEach((clearedMatchId) => {
      cancelScheduledSave(clearedMatchId)
      void clearKnockoutPredictionAction(clearedMatchId)
    })
  }

  const cancelScheduledSave = (matchId: string) => {
    const timer = timersRef.current.get(matchId)
    if (timer) {
      clearTimeout(timer)
      timersRef.current.delete(matchId)
    }
  }

  if (sortedMatches.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-white/15 bg-[#1A1A2E] p-8 text-center">
        <p className="text-sm text-white/40">
          El bracket aun no esta disponible.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-[#8B5CF6]/20 bg-[#8B5CF6]/8 p-5">
        <h2 className="font-heading text-xl font-bold uppercase tracking-wide text-white">
          Bracket de Eliminatorias
        </h2>
        <p className="mt-1 max-w-2xl text-sm text-white/50">
          Elige el ganador de cada cruce y el marcador tras 120 minutos para rascar el maximo de cada ronda.
        </p>
      </div>

      {KNOCKOUT_STAGE_ORDER.map((stage) => {
        const stageMatches = sortedMatches.filter((match) => match.stage === stage)
        if (stageMatches.length === 0) return null

        return (
          <section key={stage} className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-heading text-lg font-bold uppercase tracking-wide text-white">
                {getKnockoutStageLabel(stage)}
              </h3>
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-white/40">
                {stageMatches.filter((match) => winnerByMatchId[match.id]).length}/{stageMatches.length}
              </span>
            </div>

            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {stageMatches.map((match) => {
                const options = getKnockoutOptions({
                  matchNumber: match.match_number,
                  teams,
                  predictionsByMatchNumber: predictionByMatchNumber,
                })
                const selectedWinnerId = winnerByMatchId[match.id] ?? ''
                const selectedWinner = teams.find((team) => team.id === selectedWinnerId)
                const locked = isPredictionLocked(match)
                const scoreAfter120 = scoreAfter120ByMatchId[match.id] ?? { home: '', away: '' }

                return (
                  <article
                    key={match.id}
                    className={cn(
                      'rounded-2xl border p-4 transition-all duration-200',
                      locked
                        ? 'border-white/6 bg-[#1A1A2E]/60 opacity-60'
                        : 'border-white/8 bg-[#1A1A2E] hover:border-[#8B5CF6]/30 hover:shadow-[0_4px_20px_rgba(139,92,246,0.1)]',
                    )}
                  >
                    <div className="mb-3 flex items-start justify-between gap-3">
                      <div>
                        <p className="font-heading text-sm font-bold uppercase tracking-wide text-white">
                          {getKnockoutMatchLabel(match.match_number)}
                        </p>
                        <p className="text-xs text-white/40">
                          Partido {match.match_number} · {formatMatchDate(match.scheduled_at)}
                        </p>
                      </div>
                      <span className="rounded-full bg-[#8B5CF6]/15 border border-[#8B5CF6]/30 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[#8B5CF6]">
                        {stage.toUpperCase()}
                      </span>
                    </div>

                    <p className="mb-3 text-xs text-white/35">
                      {getKnockoutSourceLabel(match.match_number)}
                    </p>

                    <label className="block text-xs font-bold uppercase tracking-wider text-white/40">
                      Ganador del cruce
                    </label>
                    <select
                      value={selectedWinnerId}
                      disabled={locked || options.length === 0}
                      onChange={(event) => handlePickChange(match.id, event.target.value)}
                      className="mt-2 w-full rounded-xl border border-white/10 bg-white/6 px-3 py-2.5 text-sm text-white outline-none transition-all focus:border-[#8B5CF6]/60 focus:ring-2 focus:ring-[#8B5CF6]/20 disabled:cursor-not-allowed disabled:opacity-50 [&>option]:bg-[#1A1A2E] [&>option]:text-white"
                    >
                      <option value="">
                        {options.length === 0 ? 'Completa la ronda anterior' : 'Selecciona un ganador'}
                      </option>
                      {options.map((option) => (
                        <option key={option.id} value={option.id}>
                          {option.name}
                        </option>
                      ))}
                    </select>

                    <div className="mt-3">
                      <p className="text-xs font-bold uppercase tracking-wider text-white/40">
                        Marcador tras 120 minutos
                      </p>
                      <div className="mt-2 grid grid-cols-2 gap-2">
                        <input
                          type="number"
                          min={0}
                          max={20}
                          value={scoreAfter120.home}
                          disabled={locked}
                          onChange={(event) =>
                            handleScoreAfter120Change(match.id, 'home', event.target.value)
                          }
                          placeholder="Local"
                          className="w-full rounded-xl border border-white/10 bg-white/6 px-3 py-2.5 text-sm text-white outline-none transition-all focus:border-[#8B5CF6]/60 focus:ring-2 focus:ring-[#8B5CF6]/20 disabled:cursor-not-allowed disabled:opacity-50"
                        />
                        <input
                          type="number"
                          min={0}
                          max={20}
                          value={scoreAfter120.away}
                          disabled={locked}
                          onChange={(event) =>
                            handleScoreAfter120Change(match.id, 'away', event.target.value)
                          }
                          placeholder="Visitante"
                          className="w-full rounded-xl border border-white/10 bg-white/6 px-3 py-2.5 text-sm text-white outline-none transition-all focus:border-[#8B5CF6]/60 focus:ring-2 focus:ring-[#8B5CF6]/20 disabled:cursor-not-allowed disabled:opacity-50"
                        />
                      </div>
                    </div>

                    {selectedWinnerId && (
                      <div className="mt-3 rounded-xl bg-white/5 border border-white/6 px-3 py-2">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-white/35">
                          Tu pick
                        </p>
                        <p className="mt-1 flex items-center gap-2 text-sm font-semibold text-white">
                          <Flag
                            countryCode={selectedWinner?.country_code}
                            alt={selectedWinner?.name ?? 'Equipo seleccionado'}
                            size={20}
                            sourceWidth={40}
                            className="rounded-sm shadow-sm"
                            imageClassName="rounded-sm"
                            fallbackClassName="rounded-sm"
                          />
                          <span>{selectedWinner?.name ?? selectedWinnerId}</span>
                        </p>
                      </div>
                    )}

                    <div className="mt-3 flex min-h-5 items-center justify-between text-[11px]">
                      <StatusText
                        locked={locked}
                        status={statusByMatchId[match.id] ?? 'idle'}
                        hasPrediction={Boolean(selectedWinnerId)}
                      />

                      {!locked && selectedWinnerId && (
                        <button
                          type="button"
                          onClick={() => handleClear(match.id)}
                          className="font-semibold text-[#f87171]/70 transition hover:text-[#f87171]"
                        >
                          Limpiar
                        </button>
                      )}
                    </div>
                  </article>
                )
              })}
            </div>
          </section>
        )
      })}
    </div>
  )
}

function buildPredictionByMatchNumber(
  matches: MatchWithTeams[],
  winnerByMatchId: Record<string, string>
): Map<number, string> {
  return new Map(
    matches
      .map((match) => [match.match_number, winnerByMatchId[match.id]] as const)
      .filter((entry): entry is readonly [number, string] => Boolean(entry[1]))
  )
}

function pruneInvalidDescendants({
  matches,
  teams,
  winnerByMatchId,
}: {
  matches: MatchWithTeams[]
  teams: Team[]
  winnerByMatchId: Record<string, string>
}): {
  record: Record<string, string>
  clearedMatchIds: string[]
} {
  const record = { ...winnerByMatchId }
  const clearedMatchIds: string[] = []
  let changed = true

  while (changed) {
    changed = false
    const predictionsByMatchNumber = buildPredictionByMatchNumber(matches, record)

    for (const match of matches) {
      const selectedWinnerId = record[match.id]
      if (!selectedWinnerId) continue

      const options = getKnockoutOptions({
        matchNumber: match.match_number,
        teams,
        predictionsByMatchNumber,
      })

      if (!options.some((option) => option.id === selectedWinnerId)) {
        delete record[match.id]
        clearedMatchIds.push(match.id)
        changed = true
      }
    }
  }

  return { record, clearedMatchIds }
}

function StatusText({
  locked,
  status,
  hasPrediction,
}: {
  locked: boolean
  status: SaveStatus
  hasPrediction: boolean
}) {
  if (locked) return <span className="text-white/30">Cerrado</span>
  if (status === 'saving') return <span className="animate-pulse text-white/40">Guardando...</span>
  if (status === 'saved') return <span className="text-[#4ade80]">Guardado</span>
  if (status === 'error') return <span className="text-[#f87171]">Error al guardar</span>
  if (!hasPrediction) return <span className="text-white/20">Sin pick</span>
  return <span className="text-white/35">Pendiente de guardado</span>
}

function parseNullableScore(value: string | undefined): number | null {
  if (!value || value.trim() === '') return null
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}
