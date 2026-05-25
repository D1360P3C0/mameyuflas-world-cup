/**
 * Constantes de UI para MWC.
 */

/** Breakpoints en px (equivalentes a Tailwind) */
export const BREAKPOINTS = {
  xs: 375,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const

/** Reacciones disponibles en partidos */
export const MATCH_REACTIONS = ['⚽', '🔥', '😱', '🎉', '😤', '👏'] as const
export type MatchReaction = typeof MATCH_REACTIONS[number]

/** Longitud máxima de comentarios */
export const MAX_COMMENT_LENGTH = 500

/** Máximo de ligas que puede crear un usuario */
export const MAX_LEAGUES_PER_USER = 5

/** Máximo de miembros por defecto en una liga */
export const DEFAULT_MAX_LEAGUE_MEMBERS = 50

/** Horas antes del partido en las que se cierran las predicciones */
export const PREDICTION_DEADLINE_HOURS = 1

/** Longitud del código de invitación de liga */
export const LEAGUE_INVITE_CODE_LENGTH = 6
