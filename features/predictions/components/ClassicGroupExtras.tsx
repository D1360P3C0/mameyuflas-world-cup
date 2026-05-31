'use client'

import { useMemo, useState } from 'react'
import { Flag } from '@/components/ui'
import { cn } from '@/lib/utils/cn'
import {
  upsertBestThirdPredictionsAction,
  upsertGroupStandingPredictionAction,
} from '../actions/predictions.actions'
import type { MatchWithTeams } from '@/types/app.types'
import type { Tables } from '@/types/database.types'

type Team = Tables<'teams'>
type GroupStandingPrediction = Tables<'group_standing_predictions'>
type BestThirdPrediction = Tables<'best_third_predictions'>

type SaveState = 'idle' | 'saving' | 'saved' | 'error'

interface Props {
  group: string
  matches: MatchWithTeams[]
  groupStandingPrediction: GroupStandingPrediction | null
  bestThirdPredictions: BestThirdPrediction[]
}

export function ClassicGroupExtras({
  group,
  matches,
  groupStandingPrediction,
  bestThirdPredictions,
}: Props) {
  const groupTeams = useMemo(() => {
    const byId = new Map<string, Team>()

    for (const match of matches) {
      if (match.group_letter !== group) continue
      if (match.home_team_id && match.home_team) byId.set(match.home_team_id, match.home_team)
      if (match.away_team_id && match.away_team) byId.set(match.away_team_id, match.away_team)
    }

    return [...byId.values()].sort((a, b) => a.name.localeCompare(b.name))
  }, [group, matches])

  const thirdPlaceCandidates = useMemo(() => {
    const seen = new Map<string, Team>()
    for (const match of matches) {
      if (match.stage !== 'group') continue
      if (match.home_team_id && match.home_team) seen.set(match.home_team_id, match.home_team)
      if (match.away_team_id && match.away_team) seen.set(match.away_team_id, match.away_team)
    }
    return [...seen.values()].sort((a, b) => a.name.localeCompare(b.name))
  }, [matches])

  const initialGroupOrder = groupStandingPrediction
    ? [
        groupStandingPrediction.first_team_id,
        groupStandingPrediction.second_team_id,
        groupStandingPrediction.third_team_id,
        groupStandingPrediction.fourth_team_id,
      ]
    : groupTeams.map((team) => team.id)
  const initialThirdOrder = bestThirdPredictions.length > 0
    ? [...bestThirdPredictions]
        .sort((a, b) => a.ranking_position - b.ranking_position)
        .map((item) => item.team_id)
    : thirdPlaceCandidates.slice(0, 8).map((team) => team.id)

  const [orderedGroupTeamIds, setOrderedGroupTeamIds] = useState<string[]>(initialGroupOrder)
  const [orderedThirds, setOrderedThirds] = useState<string[]>(initialThirdOrder)
  const [groupStatus, setGroupStatus] = useState<SaveState>('idle')
  const [thirdsStatus, setThirdsStatus] = useState<SaveState>('idle')
  const [groupError, setGroupError] = useState<string | null>(null)
  const [thirdsError, setThirdsError] = useState<string | null>(null)

  const handleGroupSelect = (position: number, teamId: string) => {
    const next = [...orderedGroupTeamIds]
    next[position] = teamId
    setOrderedGroupTeamIds(next)
    setGroupStatus('idle')
    setGroupError(null)
  }

  const handleThirdSelect = (position: number, teamId: string) => {
    const next = [...orderedThirds]
    next[position] = teamId
    setOrderedThirds(next)
    setThirdsStatus('idle')
    setThirdsError(null)
  }

  const saveGroupStanding = async () => {
    setGroupStatus('saving')
    setGroupError(null)
    const result = await upsertGroupStandingPredictionAction(group, orderedGroupTeamIds)
    if ('error' in result) {
      setGroupError(result.error)
      setGroupStatus('error')
      return
    }
    setGroupStatus('saved')
  }

  const saveBestThirds = async () => {
    setThirdsStatus('saving')
    setThirdsError(null)
    const result = await upsertBestThirdPredictionsAction(orderedThirds)
    if ('error' in result) {
      setThirdsError(result.error)
      setThirdsStatus('error')
      return
    }
    setThirdsStatus('saved')
  }

  return (
    <div className="space-y-6">
      <section className="glass-card rounded-xl p-4">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h3 className="font-heading text-xl font-semibold text-white">Clasificacion final del grupo</h3>
            <p className="font-mono text-[10px] uppercase tracking-widest text-white/40">
              Ordena del 1 al 4 para puntuar la fase 1
            </p>
          </div>
          <StatusBadge status={groupStatus} />
        </div>

        <div className="space-y-3">
          {[0, 1, 2, 3].map((position) => (
            <PositionSelect
              key={`${group}-${position}`}
              label={`${position + 1}. puesto`}
              teams={groupTeams}
              value={orderedGroupTeamIds[position] ?? ''}
              onChange={(teamId) => handleGroupSelect(position, teamId)}
            />
          ))}
        </div>

        {groupError && (
          <p className="mt-3 rounded-lg border border-[#f87171]/30 bg-[#f87171]/8 px-3 py-2 text-sm text-[#f87171]">
            {groupError}
          </p>
        )}

        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={saveGroupStanding}
            disabled={groupStatus === 'saving' || orderedGroupTeamIds.length !== 4}
            className="rounded-xl bg-[#FF5E9F] px-4 py-2 font-heading text-sm font-bold uppercase tracking-wider text-white transition hover:bg-[#e0447f] disabled:opacity-50"
          >
            {groupStatus === 'saving' ? 'Guardando...' : 'Guardar grupo'}
          </button>
        </div>
      </section>

      <section className="glass-card rounded-xl p-4">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h3 className="font-heading text-xl font-semibold text-white">Top 8 mejores terceras</h3>
            <p className="font-mono text-[10px] uppercase tracking-widest text-white/40">
              Ranking global para la fase 2
            </p>
          </div>
          <StatusBadge status={thirdsStatus} />
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          {Array.from({ length: 8 }, (_, index) => (
            <PositionSelect
              key={`third-${index}`}
              label={`${index + 1}. tercera`}
              teams={thirdPlaceCandidates}
              value={orderedThirds[index] ?? ''}
              onChange={(teamId) => handleThirdSelect(index, teamId)}
            />
          ))}
        </div>

        {thirdsError && (
          <p className="mt-3 rounded-lg border border-[#f87171]/30 bg-[#f87171]/8 px-3 py-2 text-sm text-[#f87171]">
            {thirdsError}
          </p>
        )}

        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={saveBestThirds}
            disabled={thirdsStatus === 'saving' || orderedThirds.length !== 8}
            className="rounded-xl bg-[#00dce5] px-4 py-2 font-heading text-sm font-bold uppercase tracking-wider text-[#081018] transition hover:bg-[#0cc4cc] disabled:opacity-50"
          >
            {thirdsStatus === 'saving' ? 'Guardando...' : 'Guardar terceras'}
          </button>
        </div>
      </section>
    </div>
  )
}

function PositionSelect({
  label,
  teams,
  value,
  onChange,
}: {
  label: string
  teams: Team[]
  value: string
  onChange: (teamId: string) => void
}) {
  const selectedTeam = teams.find((team) => team.id === value) ?? null

  return (
    <div className="rounded-xl border border-white/8 bg-[#1A1A2E]/80 p-3">
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-white/50">
          {label}
        </span>
        {selectedTeam && (
          <div className="flex items-center gap-2 text-xs text-white/60">
            <Flag
              countryCode={selectedTeam.country_code}
              alt={selectedTeam.name}
              size={16}
              sourceWidth={40}
              className="rounded-sm"
              imageClassName="rounded-sm"
              fallbackClassName="rounded-sm"
            />
            <span>{selectedTeam.name}</span>
          </div>
        )}
      </div>

      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-lg border border-white/10 bg-white/6 px-3 py-2.5 text-sm text-white outline-none transition-all focus:border-[#FF5E9F]/60 focus:ring-2 focus:ring-[#FF5E9F]/20 [&>option]:bg-[#1A1A2E] [&>option]:text-white"
      >
        <option value="">Selecciona un equipo</option>
        {teams.map((team) => (
          <option key={team.id} value={team.id}>
            {team.name}
          </option>
        ))}
      </select>
    </div>
  )
}

function StatusBadge({ status }: { status: SaveState }) {
  return (
    <span
      className={cn(
        'rounded-full border px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-wider',
        status === 'saved' && 'border-[#4ade80]/30 bg-[#4ade80]/10 text-[#4ade80]',
        status === 'saving' && 'border-[#facc15]/30 bg-[#facc15]/10 text-[#facc15]',
        status === 'error' && 'border-[#f87171]/30 bg-[#f87171]/10 text-[#f87171]',
        status === 'idle' && 'border-white/10 bg-white/5 text-white/35',
      )}
    >
      {status === 'saved' ? 'Guardado' : status === 'saving' ? 'Guardando' : status === 'error' ? 'Error' : 'Sin guardar'}
    </span>
  )
}
