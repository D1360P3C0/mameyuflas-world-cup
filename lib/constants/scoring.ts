/**
 * Reglas de puntuación de MWC.
 * Todos los valores son configurables aquí sin tocar lógica de cálculo.
 */

export const SCORING_RULES = {
  /** Resultado exacto (marcador correcto) */
  EXACT_RESULT: 3,
  /** Resultado correcto (ganador o empate, pero no marcador exacto) */
  CORRECT_RESULT: 1,
  /** Campeón del Mundial acertado */
  CHAMPION: 10,
  /** Subcampeón acertado */
  RUNNER_UP: 5,
  /** Máximo goleador acertado */
  TOP_SCORER: 8,
  /** Mejor jugador (MVP) acertado */
  BEST_PLAYER: 6,
  /** Mejor portero acertado */
  BEST_KEEPER: 4,
  /** Mejor jugador joven acertado */
  BEST_YOUNG: 4,
  /** Equipo que llega a semifinales (acertado) */
  SEMIFINALIST: 3,
  /** Equipo que llega a cuartos de final (acertado) */
  QUARTERFINALIST: 2,
  /** Clasificación exacta de grupo (posición correcta) */
  GROUP_EXACT_POSITION: 2,
  /** Equipo pasa de grupo pero posición incorrecta */
  GROUP_ADVANCES: 1,
} as const

export type ScoringRule = keyof typeof SCORING_RULES

/** Puntos máximos posibles si se acierta todo */
export const MAX_POSSIBLE_POINTS =
  SCORING_RULES.CHAMPION +
  SCORING_RULES.RUNNER_UP +
  SCORING_RULES.TOP_SCORER +
  SCORING_RULES.BEST_PLAYER +
  SCORING_RULES.BEST_KEEPER +
  SCORING_RULES.BEST_YOUNG
  // + partidos + clasificaciones (se calculan dinámicamente)
