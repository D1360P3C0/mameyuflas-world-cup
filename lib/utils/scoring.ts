/**
 * Lógica de cálculo de puntos de predicciones.
 * Implementación completa en FASE 2.
 * Los valores de los puntos se configuran en lib/constants/scoring.ts.
 */
import { SCORING_RULES } from '@/lib/constants/scoring'

export type MatchResult = {
  homeGoals: number
  awayGoals: number
}

/** Calcula los puntos ganados por una predicción de partido */
export function calculateMatchPoints(
  predicted: MatchResult,
  actual: MatchResult
): number {
  // Resultado exacto
  if (predicted.homeGoals === actual.homeGoals && predicted.awayGoals === actual.awayGoals) {
    return SCORING_RULES.EXACT_RESULT
  }

  // Resultado correcto (ganador o empate)
  const predictedWinner = getWinner(predicted)
  const actualWinner = getWinner(actual)

  if (predictedWinner === actualWinner) {
    return SCORING_RULES.CORRECT_RESULT
  }

  return 0
}

function getWinner(result: MatchResult): 'home' | 'away' | 'draw' {
  if (result.homeGoals > result.awayGoals) return 'home'
  if (result.awayGoals > result.homeGoals) return 'away'
  return 'draw'
}

/** Placeholder para cálculo de puntos globales (implementar en FASE 4) */
export function calculateGlobalPredictionPoints(
  _predictionType: string,
  _predicted: string,
  _actual: string
): number {
  // TODO: Implementar en FASE 4
  return 0
}
