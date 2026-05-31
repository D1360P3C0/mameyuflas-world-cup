'use client'

/**
 * PredictionsClient — 3 vistas principales:
 *   GRUPOS   → tabs A-L + tabla virtual + tarjetas predicción
 *   BRACKET  → bracket visual con tabs por ronda (móvil-first)
 *   ESPECIALES → predicciones especiales inline
 */
import { useState } from 'react'
import { cn } from '@/lib/utils/cn'
import { GroupPredictions }    from './GroupPredictions'
import { KnockoutPredictions } from './KnockoutPredictions'
import { SpecialsClient }      from '@/app/(main)/specials/SpecialsClient'
import { GROUPS, KNOCKOUT_STAGE_ORDER, getKnockoutStageLabel } from '../utils/prediction.utils'
import type { CachedTournamentStat, MatchWithTeams } from '@/types/app.types'
import type { Tables }         from '@/types/database.types'

type Prediction         = Tables<'predictions'>
type KnockoutPrediction = Tables<'knockout_predictions'>
type Team               = Tables<'teams'>
type SpecialPrediction  = Tables<'special_predictions'>
type GroupLetter        = (typeof GROUPS)[number]
type MainView           = 'grupos' | 'bracket' | 'especiales'
type CachedStandingRow = {
  teamId: string
  name: string
  countryCode: string
  played: number
  goalDiff: number
  points: number
}

interface WorldPlayer {
  id: string
  name: string
  position: string
  team_id: string
}

interface Props {
  matches:             MatchWithTeams[]
  predictions:         Prediction[]
  knockoutPredictions: KnockoutPrediction[]
  specialPrediction:   SpecialPrediction | null
  tournamentStatsCache: CachedTournamentStat[]
  teams:               Team[]
  players:             WorldPlayer[]
}

function isCachedStandingRow(value: unknown): value is CachedStandingRow {
  if (!value || typeof value !== 'object') return false

  const row = value as Record<string, unknown>
  return (
    typeof row.teamId === 'string' &&
    typeof row.name === 'string' &&
    typeof row.countryCode === 'string' &&
    typeof row.played === 'number' &&
    typeof row.goalDiff === 'number' &&
    typeof row.points === 'number'
  )
}

/* Labels legibles para cada ronda del bracket */
const STAGE_LABELS: Record<string, string> = {
  r32:   'R32',
  r16:   'Octavos',
  qf:    'Cuartos',
  sf:    'Semis',
  '3rd': '3er P.',
  final: 'Final',
}

export function PredictionsClient({
  matches,
  predictions,
  knockoutPredictions,
  specialPrediction,
  tournamentStatsCache,
  teams,
  players,
}: Props) {
  const [mainView,  setMainView]  = useState<MainView>('grupos')
  const [groupTab,  setGroupTab]  = useState<GroupLetter>('A')
  const [predictionOverrides, setPredictionOverrides] = useState<
    Record<string, Pick<Prediction, 'match_id' | 'home_score' | 'away_score'>>
  >({})

  const groupMatches    = matches.filter(m => m.stage === 'group')
  const knockoutMatches = matches.filter(m => m.stage !== 'group')
  const predictionsMap  = new Map(predictions.map(p => [p.match_id, p]))
  const tournamentStatsMap = new Map(tournamentStatsCache.map(entry => [entry.key, entry]))

  Object.values(predictionOverrides).forEach(ov => {
    const existing = predictionsMap.get(ov.match_id)
    predictionsMap.set(ov.match_id, {
      ...(existing ?? {
        id: `local-${ov.match_id}`,
        user_id: '',
        points_earned: null,
        created_at: '',
        updated_at: '',
      }),
      match_id:   ov.match_id,
      home_score: ov.home_score,
      away_score: ov.away_score,
    })
  })

  const handlePredictionSaved = (matchId: string, homeScore: number, awayScore: number) => {
    setPredictionOverrides(cur => ({
      ...cur,
      [matchId]: { match_id: matchId, home_score: homeScore, away_score: awayScore },
    }))
  }

  const groupDone = Array.from(predictionsMap.values())
    .filter(p => groupMatches.some(m => m.id === p.match_id)).length

  /* Rondas disponibles para el bracket */
  const availableStages = KNOCKOUT_STAGE_ORDER.filter(stage =>
    knockoutMatches.some(m => m.stage === stage)
  )
  const activeGroupStandingsEntry = tournamentStatsMap.get(`group_standings_${groupTab}`)
  const realStandings = Array.isArray(activeGroupStandingsEntry?.payload)
    ? activeGroupStandingsEntry.payload.filter(isCachedStandingRow)
    : []

  return (
    <div className="relative">
      <div className="px-4 pt-5 pb-48 max-w-lg mx-auto">

        {/* Heading */}
        <h2 className="font-heading text-[28px] font-bold text-[#ffb0c9] mb-5">
          Predicciones
        </h2>

        {/* ── Navegación principal (3 vistas) ────────────────────── */}
        <div className="flex gap-2 mb-6 bg-[#1E1E2E]/60 p-1 rounded-xl border border-white/5">
          {(
            [
              { view: 'grupos'    as MainView, label: 'Grupos',     icon: 'grid_view'         },
              { view: 'bracket'   as MainView, label: 'Bracket',    icon: 'account_tree'      },
              { view: 'especiales'as MainView, label: 'Especiales', icon: 'workspace_premium' },
            ] as const
          ).map(({ view, label, icon }) => (
            <button
              key={view}
              type="button"
              onClick={() => setMainView(view)}
              className={cn(
                'flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg font-mono text-[11px] font-semibold tracking-wider transition-all',
                mainView === view
                  ? 'bg-[#FF5E9F] text-white shadow-[0_0_12px_rgba(255,94,159,0.4)]'
                  : 'text-white/40 hover:text-white/70',
              )}
            >
              <span className="material-symbols-outlined text-[16px]">{icon}</span>
              {label}
            </button>
          ))}
        </div>

        {/* ══════════════════════════════════════════════════════════ */}
        {/* VISTA: GRUPOS                                             */}
        {/* ══════════════════════════════════════════════════════════ */}
        {mainView === 'grupos' && (
          <>
            {/* Progress */}
            <div className="flex items-center gap-2 mb-5">
              <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#FF5E9F] to-[#8B5CF6] transition-all duration-500"
                  style={{ width: `${groupMatches.length > 0 ? Math.round((groupDone / groupMatches.length) * 100) : 0}%` }}
                />
              </div>
              <span className="font-mono text-[11px] font-semibold text-[#ffb0c9]">
                {groupDone}/{groupMatches.length}
              </span>
            </div>

            {/* Selector de grupo — pills scrollables */}
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-3 mb-6">
              {GROUPS.map(group => {
                const done  = groupMatches.filter(m => m.group_letter === group && predictionsMap.has(m.id)).length
                const total = groupMatches.filter(m => m.group_letter === group).length
                const isActive = groupTab === group
                return (
                  <button
                    key={group}
                    type="button"
                    onClick={() => setGroupTab(group)}
                    className={cn(
                      'flex-none px-4 py-2 rounded-full font-mono text-[12px] font-semibold tracking-wider transition-all',
                      isActive
                        ? 'bg-[#FF5E9F] text-white shadow-[0_0_15px_rgba(255,94,159,0.4)]'
                        : 'bg-[#1E1E2E] text-white/60 hover:bg-[#383848] border border-white/5',
                    )}
                  >
                    {group}
                    {done > 0 && !isActive && (
                      <span className={cn(
                        'ml-1.5 inline-flex h-1.5 w-1.5 rounded-full',
                        done === total ? 'bg-[#4ade80]' : 'bg-[#FF5E9F]',
                      )} />
                    )}
                  </button>
                )
              })}
            </div>

            <GroupPredictions
              group={groupTab}
              matches={groupMatches}
              predictionsMap={predictionsMap}
              realStandings={realStandings}
              standingsUpdatedAt={activeGroupStandingsEntry?.updated_at ?? null}
              onPredictionSaved={handlePredictionSaved}
            />
          </>
        )}

        {/* ══════════════════════════════════════════════════════════ */}
        {/* VISTA: BRACKET                                            */}
        {/* ══════════════════════════════════════════════════════════ */}
        {mainView === 'bracket' && (
          <>
            {/* Intro card */}
            <div className="glass-card rounded-xl p-4 mb-6 flex items-center gap-3">
              <span className="material-symbols-outlined text-[#d0bcff] text-[28px]"
                style={{ fontVariationSettings: "'FILL' 1" }}>account_tree</span>
              <div>
                <p className="font-heading font-semibold text-white text-sm">Fase Eliminatoria</p>
                <p className="font-mono text-[11px] text-white/40">
                  Elige el ganador de cada cruce. Las rondas se actualizan con tus picks.
                </p>
              </div>
            </div>

            {/* Tabs de ronda — scroll horizontal en móvil */}
            {availableStages.length > 0 ? (
              <KnockoutPredictions
                matches={knockoutMatches}
                predictions={knockoutPredictions}
                teams={teams}
              />
            ) : (
              /* Si no hay datos de eliminatoria aún, muestra las rondas vacías */
              <BracketPlaceholder />
            )}
          </>
        )}

        {/* ══════════════════════════════════════════════════════════ */}
        {/* VISTA: ESPECIALES                                         */}
        {/* ══════════════════════════════════════════════════════════ */}
        {mainView === 'especiales' && (
          <SpecialsClient
            initialPrediction={specialPrediction}
            teams={teams}
            players={players}
          />
        )}

      </div>

      {/* ── Botón fijo "Guardar Predicciones" (solo en vista Grupos) ── */}
      {mainView === 'grupos' && (
        <div className="fixed bottom-20 left-0 w-full px-4 z-40 pointer-events-none">
          <div className="bg-gradient-to-t from-[#121221] via-[#121221]/80 to-transparent pb-4 pt-6 pointer-events-auto max-w-lg mx-auto">
            <button
              type="button"
              className="w-full h-14 bg-[#FF5E9F] text-white font-heading text-base font-bold rounded-2xl shadow-[0_4px_25px_rgba(255,94,159,0.5)] active:scale-95 transition-all flex items-center justify-center gap-2 hover:bg-[#e0447f]"
            >
              <span className="material-symbols-outlined">save</span>
              Guardar Predicciones
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

/* Placeholder cuando no hay partidos de eliminatoria cargados */
function BracketPlaceholder() {
  const rounds = ['Ronda 32', 'Octavos', 'Cuartos', 'Semis', '3er Puesto', 'Final']
  return (
    <div className="space-y-3">
      {rounds.map(r => (
        <div key={r} className="glass-card rounded-xl p-4 flex items-center justify-between opacity-40">
          <span className="font-mono text-[12px] font-bold text-white/60 uppercase tracking-widest">{r}</span>
          <span className="font-mono text-[11px] text-white/30">Disponible tras fase de grupos</span>
        </div>
      ))}
    </div>
  )
}
