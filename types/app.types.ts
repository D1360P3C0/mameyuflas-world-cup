/**
 * Tipos de dominio de la aplicación MWC.
 * Se construyen sobre los tipos de la DB pero añaden lógica de presentación.
 */
import type { Json, Tables } from '@/types/database.types'

// -----------------------------------------------
// Re-exports con nombres semánticos
// -----------------------------------------------
export type Profile = Tables<'profiles'>
export type Team = Tables<'teams'>
export type Match = Tables<'matches'>
export type KnockoutPrediction = Tables<'knockout_predictions'>

// -----------------------------------------------
// Tipos enriquecidos para la UI
// -----------------------------------------------

/** Partido con los equipos anidados (JOIN) */
export type MatchWithTeams = Match & {
  home_team: Team | null
  away_team: Team | null
}

export type KnockoutMatch = MatchWithTeams

/** Estado de un partido */
export type MatchStatus = 'scheduled' | 'live' | 'finished' | 'postponed'

/** Etapas del torneo */
export type MatchStage = 'group' | 'r32' | 'r16' | 'qf' | 'sf' | '3rd' | 'final'

/** Tipos de predicción */
export type PredictionType =
  | 'match_result'
  | 'champion'
  | 'runner_up'
  | 'top_scorer'
  | 'top_assist'
  | 'best_player'
  | 'best_keeper'
  | 'best_young'
  | 'group_position'
  | 'semifinalist'
  | 'quarterfinalist'

export type CachedTournamentStat = {
  key: string
  payload: Json
  updated_at: string
}

/** Usuario autenticado simplificado para contexto de la app */
export type AuthUser = {
  id: string
  email: string | undefined
  profile: Profile | null
}

/** Entrada del leaderboard */
export type LeaderboardEntry = {
  user_id: string
  total_points: number
  exact_results: number
  correct_results: number
  rank_global: number
  updated_at: string
  profile: Pick<Profile, 'username' | 'display_name' | 'avatar_url' | 'country_code'>
}
