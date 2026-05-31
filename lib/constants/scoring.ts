/**
 * Reglas de puntuacion de MWC.
 * Centraliza valores, maximos y reparto por fase.
 */

export const SCORING_RULES = {
  CLASSIC: {
    MAX_POINTS: 1685,
  },
  GROUP_STAGE: {
    MAX_POINTS: 600,
    MATCHES_MAX_POINTS: 384,
    STANDINGS_MAX_POINTS: 216,
    MATCH: {
      EXACT_SCORE: 8,
      CORRECT_OUTCOME: 4,
      ONE_TEAM_GOALS: 2,
    },
    STANDINGS: {
      EXACT_ORDER: 18,
      QUALIFIERS_IN_ORDER: 12,
      QUALIFIERS_ANY_ORDER: 8,
      GROUP_WINNER_ONLY: 4,
    },
  },
  BEST_THIRDS: {
    MAX_POINTS: 30,
    TEAM_INCLUDED: 2,
    ALL_QUALIFIED_BONUS: 6,
    PERFECT_ORDER_BONUS: 8,
  },
  KNOCKOUT: {
    MAX_POINTS: 1055,
    PROGRESSION: {
      REACH_R32: 2,
      REACH_R16: 5,
      REACH_QF: 10,
      REACH_SF: 18,
      REACH_FINAL: 30,
      CHAMPION: 100,
      RUNNER_UP: 50,
      THIRD_PLACE: 25,
    },
    /**
     * Reparto inferido a partir de los rangos y maximos compartidos por producto:
     * pairing + qualified + scoreAfter120 = maximo por cruce.
     */
    MATCH: {
      r32: {
        PAIRING: 2,
        QUALIFIED: 4,
        SCORE_AFTER_120: 3,
        MAX_POINTS: 9,
      },
      r16: {
        PAIRING: 3,
        QUALIFIED: 5,
        SCORE_AFTER_120: 4,
        MAX_POINTS: 12,
      },
      qf: {
        PAIRING: 4,
        QUALIFIED: 6,
        SCORE_AFTER_120: 6,
        MAX_POINTS: 16,
      },
      sf: {
        PAIRING: 5,
        QUALIFIED: 8,
        SCORE_AFTER_120: 8,
        MAX_POINTS: 21,
      },
      '3rd': {
        PAIRING: 6,
        QUALIFIED: 9,
        SCORE_AFTER_120: 8,
        MAX_POINTS: 23,
      },
      final: {
        PAIRING: 6,
        QUALIFIED: 15,
        SCORE_AFTER_120: 8,
        MAX_POINTS: 29,
      },
    },
  },
  SPECIALS: {
    MAX_POINTS: 126,
    TOP_SCORER: 30,
    MVP: 24,
    REVELATION_TEAM: 24,
    BEST_GOALKEEPER: 18,
    MOST_GOALS_IN_GROUPS: 15,
    FEWEST_GOALS_AGAINST_IN_GROUPS: 15,
  },
} as const

export type KnockoutScoringRound = keyof typeof SCORING_RULES.KNOCKOUT.MATCH

export const MAX_POSSIBLE_POINTS = SCORING_RULES.CLASSIC.MAX_POINTS
