'use client'

/**
 * GroupPredictions — diseño Stitch exacto.
 * • Tabla de "Clasificación Virtual" (calculada de las predicciones)
 * • Cards de partidos organizadas por Jornada
 */
import { useMemo } from 'react'
import { Flag } from '@/components/ui'
import { MatchPredictionCard } from './MatchPredictionCard'
import type { MatchWithTeams } from '@/types/app.types'
import type { Tables } from '@/types/database.types'

type Prediction = Tables<'predictions'>

/* ── Clasificación virtual ─────────────────────────────────── */
interface TeamStanding {
  teamId:      string
  name:        string
  countryCode: string
  played:      number
  goalDiff:    number
  points:      number
}

function computeVirtualStandings(
  matches:        MatchWithTeams[],
  predictionsMap: Map<string, Prediction>,
): TeamStanding[] {
  const standings = new Map<string, TeamStanding>()

  for (const match of matches) {
    if (!match.home_team || !match.away_team || !match.home_team_id || !match.away_team_id) continue

    if (!standings.has(match.home_team_id)) {
      standings.set(match.home_team_id, {
        teamId:      match.home_team_id,
        name:        match.home_team.name,
        countryCode: match.home_team.country_code ?? '',
        played: 0, goalDiff: 0, points: 0,
      })
    }
    if (!standings.has(match.away_team_id)) {
      standings.set(match.away_team_id, {
        teamId:      match.away_team_id,
        name:        match.away_team.name,
        countryCode: match.away_team.country_code ?? '',
        played: 0, goalDiff: 0, points: 0,
      })
    }

    const pred = predictionsMap.get(match.id)
    if (!pred || pred.home_score === null || pred.away_score === null) continue

    const home = standings.get(match.home_team_id)!
    const away = standings.get(match.away_team_id)!
    const hg   = pred.home_score
    const ag   = pred.away_score

    home.played++; away.played++
    home.goalDiff += hg - ag
    away.goalDiff += ag - hg

    if (hg > ag)      { home.points += 3 }
    else if (hg === ag) { home.points += 1; away.points += 1 }
    else               { away.points += 3 }
  }

  return [...standings.values()].sort((a, b) =>
    b.points - a.points || b.goalDiff - a.goalDiff,
  )
}

/* ── Colores de borde para posiciones (clasificación) ─────── */
const BORDER_COLORS = [
  'border-l-[#FF5E9F]',
  'border-l-[#00dce5]',
  'border-l-transparent',
  'border-l-transparent',
]
const ROW_BG = [
  'bg-[#1E1E2E]/50',
  'bg-[#1E1E2E]/30',
  'bg-transparent',
  'bg-transparent',
]

/* ── Componente ────────────────────────────────────────────── */
interface Props {
  group:             string
  matches:           MatchWithTeams[]
  predictionsMap:    Map<string, Prediction>
  realStandings?:    TeamStanding[]
  standingsUpdatedAt?: string | null
  onPredictionSaved: (matchId: string, homeScore: number, awayScore: number) => void
}

export function GroupPredictions({
  group,
  matches,
  predictionsMap,
  realStandings = [],
  standingsUpdatedAt = null,
  onPredictionSaved,
}: Props) {
  const groupMatches = matches
    .filter(m => m.group_letter === group)
    .sort((a, b) => a.match_number - b.match_number)

  const virtualStandings = useMemo(
    () => computeVirtualStandings(groupMatches, predictionsMap),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [groupMatches, predictionsMap],
  )
  const standings = realStandings.length > 0 ? realStandings : virtualStandings
  const standingsTitle = realStandings.length > 0 ? 'Clasificacion' : 'Clasificacion virtual'
  const standingsSubtitle = standingsUpdatedAt
    ? `Actualizado ${new Date(standingsUpdatedAt).toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'short',
      })}`
    : realStandings.length > 0
      ? 'Datos reales del torneo'
      : 'Basada en tus predicciones'

  if (groupMatches.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-white/30">
        No hay partidos para el Grupo {group}
      </p>
    )
  }

  /* Agrupar por jornada */
  const byMatchday = groupMatches.reduce<Record<number, MatchWithTeams[]>>((acc, m) => {
    const md = Math.ceil((((m.match_number - 1) % 6) + 1) / 2)
    if (!acc[md]) acc[md] = []
    acc[md].push(m)
    return acc
  }, {})

  return (
    <div className="space-y-6">

      {/* ── Clasificación Virtual ──────────────────────────────── */}
      <div className="glass-card rounded-xl p-4 overflow-hidden relative">
        {/* Icono decorativo de fondo */}
        <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
          <span className="material-symbols-outlined text-[64px]">leaderboard</span>
        </div>

        <div className="flex items-start gap-2 mb-4">
          <span className="w-2 h-6 bg-[#FF5E9F] rounded-full" />
          <div>
            <h3 className="font-heading text-xl font-semibold text-white">{standingsTitle}</h3>
            <p className="font-mono text-[10px] uppercase tracking-widest text-white/40">
              {standingsSubtitle}
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {/* Cabecera de columnas */}
          <div className="grid grid-cols-12 font-mono text-[11px] font-semibold tracking-widest text-white/60 px-2">
            <div className="col-span-6">EQUIPO</div>
            <div className="col-span-2 text-center">PJ</div>
            <div className="col-span-2 text-center">DG</div>
            <div className="col-span-2 text-center text-[#ffb0c9]">PTS</div>
          </div>

          {/* Filas */}
          {standings.map((team, i) => (
            <div
              key={team.teamId}
              className={`grid grid-cols-12 items-center p-3 rounded-lg border-l-4
                ${BORDER_COLORS[i] ?? 'border-l-transparent'}
                ${ROW_BG[i] ?? 'bg-transparent'}`}
            >
              <div className="col-span-6 flex items-center gap-3">
                <span className="font-mono text-[12px] text-white/60">{i + 1}</span>
                <Flag
                  countryCode={team.countryCode}
                  alt={team.name}
                  size={20}
                  sourceWidth={40}
                  className="rounded-sm shadow-sm"
                  imageClassName="rounded-sm"
                  fallbackClassName="rounded-sm"
                />
                <span className="font-heading font-bold text-white text-sm truncate">{team.name}</span>
              </div>
              <div className="col-span-2 text-center font-mono text-[12px] text-white/60">{team.played}</div>
              <div className="col-span-2 text-center font-mono text-[12px] text-white/60">
                {team.goalDiff > 0 ? '+' : ''}{team.goalDiff}
              </div>
              <div className={`col-span-2 text-center font-heading font-bold text-sm ${i < 2 ? 'text-[#ffb0c9]' : 'text-white'}`}>
                {team.points}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Tarjetas de partidos por Jornada ────────────────────── */}
      {Object.entries(byMatchday).map(([md, mdMatches]) => {
        const firstDate = mdMatches[0]?.scheduled_at
        const dateLabel = firstDate
          ? new Date(firstDate).toLocaleDateString('es-ES', { day: 'numeric', month: 'long' }).toUpperCase()
          : ''

        return (
          <div key={md} className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className={`font-heading text-xl font-semibold ${parseInt(md) === 1 ? 'text-[#00dce5]' : 'text-white/60'}`}>
                Jornada {md}
              </h3>
              {dateLabel && (
                <span className="font-mono text-[11px] font-semibold text-white/60 tracking-widest">
                  {dateLabel}
                </span>
              )}
            </div>

            {mdMatches.map(match => (
              <MatchPredictionCard
                key={match.id}
                match={match}
                prediction={predictionsMap.get(match.id) ?? null}
                onPredictionSaved={onPredictionSaved}
              />
            ))}
          </div>
        )
      })}
    </div>
  )
}
