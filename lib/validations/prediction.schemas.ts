/**
 * Schemas de validacion Zod para predicciones.
 * Implementacion completa en FASE 2.
 */
import { z } from 'zod'

export const matchPredictionSchema = z.object({
  matchId: z.string().uuid('ID de partido invalido'),
  homeGoals: z
    .number()
    .int()
    .min(0, 'No puede ser negativo')
    .max(20, 'Resultado irreal'),
  awayGoals: z
    .number()
    .int()
    .min(0, 'No puede ser negativo')
    .max(20, 'Resultado irreal'),
})

export const globalPredictionSchema = z.object({
  predictionType: z.enum([
    'champion',
    'runner_up',
    'revelation_team',
    'top_scorer',
    'top_assist',
    'best_player',
    'best_keeper',
    'best_young',
    'most_goals_in_groups',
    'fewest_goals_against_in_groups',
  ]),
  value: z.string().min(1, 'Selecciona una opcion'),
})

export const knockoutPredictionSchema = z.object({
  matchId: z.string().uuid('ID de partido invalido'),
  winnerTeamId: z.string().min(3, 'Selecciona un equipo'),
  homeGoalsAfter120: z
    .number()
    .int()
    .min(0, 'No puede ser negativo')
    .max(20, 'Resultado irreal')
    .nullable()
    .optional(),
  awayGoalsAfter120: z
    .number()
    .int()
    .min(0, 'No puede ser negativo')
    .max(20, 'Resultado irreal')
    .nullable()
    .optional(),
}).refine(
  (input) =>
    (input.homeGoalsAfter120 == null && input.awayGoalsAfter120 == null) ||
    (input.homeGoalsAfter120 != null && input.awayGoalsAfter120 != null),
  {
    message: 'Debes indicar ambos marcadores tras 120 minutos',
    path: ['homeGoalsAfter120'],
  }
)

export const groupStandingPredictionSchema = z.object({
  groupLetter: z.enum(['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L']),
  orderedTeamIds: z
    .array(z.string().min(3, 'Selecciona un equipo'))
    .length(4, 'Debes indicar 4 equipos')
    .refine((teamIds) => new Set(teamIds).size === teamIds.length, {
      message: 'No puede haber equipos repetidos',
    }),
})

export const bestThirdPredictionSchema = z.object({
  orderedTeamIds: z
    .array(z.string().min(3, 'Selecciona un equipo'))
    .length(8, 'Debes indicar 8 selecciones')
    .refine((teamIds) => new Set(teamIds).size === teamIds.length, {
      message: 'No puede haber equipos repetidos',
    }),
})

export type MatchPredictionInput = z.infer<typeof matchPredictionSchema>
export type GlobalPredictionInput = z.infer<typeof globalPredictionSchema>
export type KnockoutPredictionInput = z.infer<typeof knockoutPredictionSchema>
export type GroupStandingPredictionInput = z.infer<typeof groupStandingPredictionSchema>
export type BestThirdPredictionInput = z.infer<typeof bestThirdPredictionSchema>
