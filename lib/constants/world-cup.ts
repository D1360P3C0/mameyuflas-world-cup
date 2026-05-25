/**
 * Datos del Mundial 2026.
 * 48 equipos, 12 grupos de 4 (A–L).
 * Los grupos y equipos se completarán cuando esté disponible el sorteo oficial.
 *
 * Fase de grupos: 12 grupos x 6 partidos = 72 partidos
 * Eliminatorias: 16 (r32) + 8 (r16) + 4 (qf) + 2 (sf) + 1 (3rd) + 1 (final) = 32 partidos
 * Total: 104 partidos
 */

export const WORLD_CUP_2026 = {
  year: 2026,
  name: 'FIFA World Cup 2026™',
  totalTeams: 48,
  totalGroups: 12,
  groupLetters: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'] as const,
  totalMatches: 104,
  hosts: ['USA', 'CAN', 'MEX'] as const,
  stages: {
    GROUP: 'group',
    ROUND_OF_32: 'r32',
    ROUND_OF_16: 'r16',
    QUARTER_FINAL: 'qf',
    SEMI_FINAL: 'sf',
    THIRD_PLACE: '3rd',
    FINAL: 'final',
  } as const,
} as const

export type WorldCupStage = typeof WORLD_CUP_2026.stages[keyof typeof WORLD_CUP_2026.stages]
export type GroupLetter = typeof WORLD_CUP_2026.groupLetters[number]

/** Etiquetas legibles de las fases */
export const STAGE_LABELS: Record<WorldCupStage, string> = {
  group: 'Fase de Grupos',
  r32: 'Ronda de 32',
  r16: 'Octavos de Final',
  qf: 'Cuartos de Final',
  sf: 'Semifinales',
  '3rd': 'Tercer Puesto',
  final: 'Final',
}
