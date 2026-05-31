/**
 * Utilidades para el modulo de predicciones.
 * Modo clasico: todo se cierra al comenzar el torneo.
 */
import { STAGE_LABELS } from '@/lib/constants/world-cup'
import type { MatchStage } from '@/types/app.types'
import type { Tables } from '@/types/database.types'

type MatchForLockCheck = Pick<Tables<'matches'>, 'scheduled_at' | 'status'>
type KnockoutPrediction = Tables<'knockout_predictions'>
type Team = Tables<'teams'>

export type KnockoutStage = Extract<MatchStage, 'r32' | 'r16' | 'qf' | 'sf' | '3rd' | 'final'>

export type KnockoutSlotDefinition = {
  matchNumber: number
  stage: KnockoutStage
  sourceMatchNumbers: number[]
}

export type KnockoutOption = {
  id: string
  name: string
  country_code: string | null
}

/** Estan cerradas las predicciones para este partido? */
export function isPredictionLocked(match: MatchForLockCheck): boolean {
  return areClassicPredictionsLocked() || match.status !== 'scheduled'
}

/** Inicio oficial del torneo segun el seed actual: 11 Jun 2026, 21:00 UTC. */
export const TOURNAMENT_START_AT = new Date('2026-06-11T21:00:00Z')

export function areClassicPredictionsLocked(): boolean {
  return Date.now() >= TOURNAMENT_START_AT.getTime()
}

export function areSpecialPredictionsLocked(): boolean {
  return areClassicPredictionsLocked()
}

/**
 * Numero de jornada dentro del grupo (1, 2 o 3).
 * Basado en el esquema de numeracion del seed (6 partidos por grupo, en pares).
 */
export function getGroupMatchday(matchNumber: number): number {
  const indexInGroup = (matchNumber - 1) % 6
  return Math.ceil((indexInGroup + 1) / 2)
}

/** Grupos del Mundial 2026 */
export const GROUPS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'] as const
export type GroupLetter = (typeof GROUPS)[number]

export const KNOCKOUT_STAGE_ORDER: KnockoutStage[] = [
  'r32',
  'r16',
  'qf',
  'sf',
  '3rd',
  'final',
]

export const KNOCKOUT_SLOTS: KnockoutSlotDefinition[] = [
  ...Array.from({ length: 16 }, (_, index) => ({
    matchNumber: 73 + index,
    stage: 'r32' as const,
    sourceMatchNumbers: [],
  })),
  ...Array.from({ length: 8 }, (_, index) => ({
    matchNumber: 89 + index,
    stage: 'r16' as const,
    sourceMatchNumbers: [73 + index * 2, 74 + index * 2],
  })),
  ...Array.from({ length: 4 }, (_, index) => ({
    matchNumber: 97 + index,
    stage: 'qf' as const,
    sourceMatchNumbers: [89 + index * 2, 90 + index * 2],
  })),
  {
    matchNumber: 101,
    stage: 'sf',
    sourceMatchNumbers: [97, 98],
  },
  {
    matchNumber: 102,
    stage: 'sf',
    sourceMatchNumbers: [99, 100],
  },
  {
    matchNumber: 103,
    stage: '3rd',
    sourceMatchNumbers: [101, 102],
  },
  {
    matchNumber: 104,
    stage: 'final',
    sourceMatchNumbers: [101, 102],
  },
]

const KNOCKOUT_SLOT_MAP = new Map(
  KNOCKOUT_SLOTS.map((slot) => [slot.matchNumber, slot])
)

export function getKnockoutSlot(matchNumber: number): KnockoutSlotDefinition | undefined {
  return KNOCKOUT_SLOT_MAP.get(matchNumber)
}

export function getKnockoutStageLabel(stage: KnockoutStage): string {
  return STAGE_LABELS[stage]
}

export function getKnockoutMatchLabel(matchNumber: number): string {
  const slot = getKnockoutSlot(matchNumber)
  if (!slot) return `Partido ${matchNumber}`
  const index = KNOCKOUT_SLOTS.filter((item) => item.stage === slot.stage)
    .findIndex((item) => item.matchNumber === matchNumber)

  return `${getKnockoutStageLabel(slot.stage)} ${index + 1}`
}

export function getKnockoutSourceLabel(matchNumber: number): string {
  const slot = getKnockoutSlot(matchNumber)
  if (!slot) return `Partido ${matchNumber}`
  if (slot.stage === 'r32') return `Slot ${matchNumber - 72}`
  if (slot.stage === '3rd') return 'Perdedor de semifinal'
  return `Ganador ${slot.sourceMatchNumbers[0]} vs Ganador ${slot.sourceMatchNumbers[1]}`
}

export function buildKnockoutPredictionMap(
  predictions: KnockoutPrediction[]
): Map<string, KnockoutPrediction> {
  return new Map(predictions.map((prediction) => [prediction.match_id, prediction]))
}

export function getKnockoutOptions(params: {
  matchNumber: number
  teams: Team[]
  predictionsByMatchNumber: Map<number, string>
}): KnockoutOption[] {
  const slot = getKnockoutSlot(params.matchNumber)
  if (!slot) return []

  if (slot.stage === 'r32') {
    return params.teams.map((team) => ({
      id: team.id,
      name: team.name,
      country_code: team.country_code,
    }))
  }

  if (slot.stage === '3rd') {
    return slot.sourceMatchNumbers
      .flatMap((sourceMatchNumber) =>
        getSemifinalLoserOptions(
          sourceMatchNumber,
          params.predictionsByMatchNumber,
          params.teams
        )
      )
      .filter(uniqueOptionById)
  }

  return slot.sourceMatchNumbers
    .map((sourceMatchNumber) => params.predictionsByMatchNumber.get(sourceMatchNumber))
    .filter((teamId): teamId is string => Boolean(teamId))
    .map((teamId) => params.teams.find((team) => team.id === teamId))
    .filter((team): team is Team => Boolean(team))
    .map((team) => ({
      id: team.id,
      name: team.name,
      country_code: team.country_code,
    }))
}

function getSemifinalLoserOptions(
  matchNumber: number,
  predictionsByMatchNumber: Map<number, string>,
  teams: Team[]
): KnockoutOption[] {
  const slot = getKnockoutSlot(matchNumber)
  if (!slot) return []

  const semifinalWinnerId = predictionsByMatchNumber.get(matchNumber)
  const participants = slot.sourceMatchNumbers
    .map((sourceMatchNumber) => predictionsByMatchNumber.get(sourceMatchNumber))
    .filter((teamId): teamId is string => Boolean(teamId))

  return participants
    .filter((teamId) => teamId !== semifinalWinnerId)
    .map((teamId) => teams.find((team) => team.id === teamId))
    .filter((team): team is Team => Boolean(team))
    .map((team) => ({
      id: team.id,
      name: team.name,
      country_code: team.country_code,
    }))
}

function uniqueOptionById(
  option: KnockoutOption,
  index: number,
  list: KnockoutOption[]
): boolean {
  return list.findIndex((item) => item.id === option.id) === index
}
