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
    'top_scorer',
    'top_assist',
    'best_player',
    'best_keeper',
    'best_young',
  ]),
  value: z.string().min(1, 'Selecciona una opcion'),
})

export const knockoutPredictionSchema = z.object({
  matchId: z.string().uuid('ID de partido invalido'),
  winnerTeamId: z.string().min(3, 'Selecciona un equipo'),
})

export type MatchPredictionInput = z.infer<typeof matchPredictionSchema>
export type GlobalPredictionInput = z.infer<typeof globalPredictionSchema>
export type KnockoutPredictionInput = z.infer<typeof knockoutPredictionSchema>
