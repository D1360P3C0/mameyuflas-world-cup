/**
 * Motor de puntuacion para el modo clasico.
 * Se mantiene desacoplado de la DB para poder reutilizarlo en cron jobs,
 * server actions y tests sin depender del shape actual de Supabase.
 */
import { SCORING_RULES, type KnockoutScoringRound } from '@/lib/constants/scoring'

export type MatchResult = {
  homeGoals: number
  awayGoals: number
}

export type MatchScoreCategory =
  | 'exact_score'
  | 'correct_outcome'
  | 'one_team_goals'
  | 'miss'

export type GroupStandingsScoreCategory =
  | 'exact_order'
  | 'qualifiers_in_order'
  | 'qualifiers_any_order'
  | 'group_winner_only'
  | 'miss'

export type KnockoutProgressStage = 'r32' | 'r16' | 'qf' | 'sf' | 'final'

export type KnockoutMatchPrediction = {
  round: KnockoutScoringRound
  homeTeamId: string | null
  awayTeamId: string | null
  winnerTeamId: string | null
  homeGoalsAfter120?: number | null
  awayGoalsAfter120?: number | null
}

export type TournamentSpecialPredictions = {
  topScorer?: string | null
  mvp?: string | null
  revelationTeamId?: string | null
  bestGoalkeeper?: string | null
  mostGoalsInGroupsTeamId?: string | null
  fewestGoalsAgainstInGroupsTeamId?: string | null
}

export type GroupMatchScoreBreakdown = {
  category: MatchScoreCategory
  points: number
}

export type GroupStandingsScoreBreakdown = {
  category: GroupStandingsScoreCategory
  points: number
}

export type BestThirdsScoreBreakdown = {
  points: number
  includedTeams: number
  qualifiedTeamsBonus: boolean
  perfectOrderBonus: boolean
}

export type KnockoutMatchScoreBreakdown = {
  round: KnockoutScoringRound
  pairingPoints: number
  qualifiedPoints: number
  scorePoints: number
  points: number
}

export type KnockoutScoreBreakdown = {
  progressionPoints: number
  podiumPoints: number
  matchupPoints: number
  points: number
  matches: KnockoutMatchScoreBreakdown[]
}

export type SpecialsScoreBreakdown = TournamentSpecialPredictions & {
  points: number
}

export type TournamentScoreInput = {
  groupMatches?: Array<{
    predicted: MatchResult
    actual: MatchResult
  }>
  groupStandings?: Array<{
    predictedTeamIds: string[]
    actualTeamIds: string[]
  }>
  bestThirds?: {
    predictedTeamIds: string[]
    actualTeamIds: string[]
  }
  knockout?: {
    predictedMatches: KnockoutMatchPrediction[]
    actualMatches: KnockoutMatchPrediction[]
  }
  specials?: {
    predicted: TournamentSpecialPredictions
    actual: TournamentSpecialPredictions
  }
}

export type TournamentScoreBreakdown = {
  totalPoints: number
  groupStage: {
    matchPoints: number
    standingsPoints: number
    points: number
  }
  bestThirds: BestThirdsScoreBreakdown
  knockout: KnockoutScoreBreakdown
  specials: SpecialsScoreBreakdown
}

/** Compatibilidad con el helper antiguo. */
export function calculateMatchPoints(
  predicted: MatchResult,
  actual: MatchResult
): number {
  return calculateGroupMatchScore(predicted, actual).points
}

export function calculateGroupMatchScore(
  predicted: MatchResult,
  actual: MatchResult
): GroupMatchScoreBreakdown {
  if (predicted.homeGoals === actual.homeGoals && predicted.awayGoals === actual.awayGoals) {
    return {
      category: 'exact_score',
      points: SCORING_RULES.GROUP_STAGE.MATCH.EXACT_SCORE,
    }
  }

  const predictedWinner = getWinner(predicted)
  const actualWinner = getWinner(actual)

  if (predictedWinner === actualWinner) {
    return {
      category: 'correct_outcome',
      points: SCORING_RULES.GROUP_STAGE.MATCH.CORRECT_OUTCOME,
    }
  }

  const exactTeams =
    Number(predicted.homeGoals === actual.homeGoals) +
    Number(predicted.awayGoals === actual.awayGoals)

  if (exactTeams === 1) {
    return {
      category: 'one_team_goals',
      points: SCORING_RULES.GROUP_STAGE.MATCH.ONE_TEAM_GOALS,
    }
  }

  return { category: 'miss', points: 0 }
}

export function calculateGroupStandingsPoints(
  predictedTeamIds: string[],
  actualTeamIds: string[]
): GroupStandingsScoreBreakdown {
  const predictedTop4 = predictedTeamIds.slice(0, 4)
  const actualTop4 = actualTeamIds.slice(0, 4)

  if (predictedTop4.length < 4 || actualTop4.length < 4) {
    return { category: 'miss', points: 0 }
  }

  if (predictedTop4.every((teamId, index) => teamId === actualTop4[index])) {
    return {
      category: 'exact_order',
      points: SCORING_RULES.GROUP_STAGE.STANDINGS.EXACT_ORDER,
    }
  }

  const predictedQualifiers = predictedTop4.slice(0, 2)
  const actualQualifiers = actualTop4.slice(0, 2)

  if (predictedQualifiers[0] === actualQualifiers[0] && predictedQualifiers[1] === actualQualifiers[1]) {
    return {
      category: 'qualifiers_in_order',
      points: SCORING_RULES.GROUP_STAGE.STANDINGS.QUALIFIERS_IN_ORDER,
    }
  }

  if (haveSameMembers(predictedQualifiers, actualQualifiers)) {
    return {
      category: 'qualifiers_any_order',
      points: SCORING_RULES.GROUP_STAGE.STANDINGS.QUALIFIERS_ANY_ORDER,
    }
  }

  if (predictedTop4[0] === actualTop4[0]) {
    return {
      category: 'group_winner_only',
      points: SCORING_RULES.GROUP_STAGE.STANDINGS.GROUP_WINNER_ONLY,
    }
  }

  return { category: 'miss', points: 0 }
}

export function calculateBestThirdsPoints(
  predictedTeamIds: string[],
  actualTeamIds: string[]
): BestThirdsScoreBreakdown {
  const predictedTop8 = predictedTeamIds.slice(0, 8)
  const actualTop8 = actualTeamIds.slice(0, 8)

  const includedTeams = predictedTop8.filter((teamId) => actualTop8.includes(teamId)).length
  const qualifiedTeamsBonus =
    predictedTop8.length === 8 &&
    actualTop8.length === 8 &&
    haveSameMembers(predictedTop8, actualTop8)
  const perfectOrderBonus =
    qualifiedTeamsBonus &&
    predictedTop8.every((teamId, index) => teamId === actualTop8[index])

  let points = includedTeams * SCORING_RULES.BEST_THIRDS.TEAM_INCLUDED
  if (qualifiedTeamsBonus) points += SCORING_RULES.BEST_THIRDS.ALL_QUALIFIED_BONUS
  if (perfectOrderBonus) points += SCORING_RULES.BEST_THIRDS.PERFECT_ORDER_BONUS

  return {
    points,
    includedTeams,
    qualifiedTeamsBonus,
    perfectOrderBonus,
  }
}

export function calculateKnockoutPoints(input: {
  predictedMatches: KnockoutMatchPrediction[]
  actualMatches: KnockoutMatchPrediction[]
}): KnockoutScoreBreakdown {
  const progressionPoints = calculateKnockoutProgressionPoints(
    input.predictedMatches,
    input.actualMatches
  )
  const podiumPoints = calculateKnockoutPodiumPoints(input.predictedMatches, input.actualMatches)

  const predictedByRoundAndPairing = new Map<string, KnockoutMatchPrediction>()
  for (const match of input.predictedMatches) {
    const key = getRoundAndPairingKey(match)
    if (key) predictedByRoundAndPairing.set(key, match)
  }

  const matches = input.actualMatches.map((actualMatch) => {
    const predictedMatch = predictedByRoundAndPairing.get(getRoundAndPairingKey(actualMatch) ?? '')
    return calculateKnockoutMatchPoints(predictedMatch ?? null, actualMatch)
  })

  const matchupPoints = matches.reduce((sum, match) => sum + match.points, 0)

  return {
    progressionPoints,
    podiumPoints,
    matchupPoints,
    points: progressionPoints + podiumPoints + matchupPoints,
    matches,
  }
}

export function calculateKnockoutMatchPoints(
  predictedMatch: KnockoutMatchPrediction | null,
  actualMatch: KnockoutMatchPrediction
): KnockoutMatchScoreBreakdown {
  const roundRules = SCORING_RULES.KNOCKOUT.MATCH[actualMatch.round]

  if (!predictedMatch) {
    return {
      round: actualMatch.round,
      pairingPoints: 0,
      qualifiedPoints: 0,
      scorePoints: 0,
      points: 0,
    }
  }

  const samePairing = haveSamePairing(predictedMatch, actualMatch)
  const pairingPoints = samePairing ? roundRules.PAIRING : 0
  const qualifiedPoints =
    samePairing && predictedMatch.winnerTeamId === actualMatch.winnerTeamId
      ? roundRules.QUALIFIED
      : 0
  const scorePoints =
    samePairing && isExactScoreAfter120(predictedMatch, actualMatch)
      ? roundRules.SCORE_AFTER_120
      : 0

  return {
    round: actualMatch.round,
    pairingPoints,
    qualifiedPoints,
    scorePoints,
    points: pairingPoints + qualifiedPoints + scorePoints,
  }
}

export function calculateSpecialPredictionPoints(
  predicted: TournamentSpecialPredictions,
  actual: TournamentSpecialPredictions
): SpecialsScoreBreakdown {
  let points = 0

  if (sameLooseValue(predicted.topScorer, actual.topScorer)) {
    points += SCORING_RULES.SPECIALS.TOP_SCORER
  }
  if (sameLooseValue(predicted.mvp, actual.mvp)) {
    points += SCORING_RULES.SPECIALS.MVP
  }
  if (sameExactValue(predicted.revelationTeamId, actual.revelationTeamId)) {
    points += SCORING_RULES.SPECIALS.REVELATION_TEAM
  }
  if (sameLooseValue(predicted.bestGoalkeeper, actual.bestGoalkeeper)) {
    points += SCORING_RULES.SPECIALS.BEST_GOALKEEPER
  }
  if (sameExactValue(predicted.mostGoalsInGroupsTeamId, actual.mostGoalsInGroupsTeamId)) {
    points += SCORING_RULES.SPECIALS.MOST_GOALS_IN_GROUPS
  }
  if (
    sameExactValue(
      predicted.fewestGoalsAgainstInGroupsTeamId,
      actual.fewestGoalsAgainstInGroupsTeamId
    )
  ) {
    points += SCORING_RULES.SPECIALS.FEWEST_GOALS_AGAINST_IN_GROUPS
  }

  return {
    ...predicted,
    points,
  }
}

/** Compatibilidad basica con el helper placeholder anterior. */
export function calculateGlobalPredictionPoints(
  predictionType: string,
  predicted: string,
  actual: string
): number {
  if (!sameLooseValue(predicted, actual)) return 0

  switch (predictionType) {
    case 'top_scorer':
      return SCORING_RULES.SPECIALS.TOP_SCORER
    case 'mvp':
    case 'best_player':
      return SCORING_RULES.SPECIALS.MVP
    case 'best_goalkeeper':
    case 'best_keeper':
      return SCORING_RULES.SPECIALS.BEST_GOALKEEPER
    case 'surprise_team':
    case 'revelation_team':
      return SCORING_RULES.SPECIALS.REVELATION_TEAM
    case 'most_goals_in_groups':
      return SCORING_RULES.SPECIALS.MOST_GOALS_IN_GROUPS
    case 'fewest_goals_against_in_groups':
      return SCORING_RULES.SPECIALS.FEWEST_GOALS_AGAINST_IN_GROUPS
    default:
      return 0
  }
}

export function calculateTournamentScore(
  input: TournamentScoreInput
): TournamentScoreBreakdown {
  const matchPoints =
    input.groupMatches?.reduce(
      (sum, match) => sum + calculateGroupMatchScore(match.predicted, match.actual).points,
      0
    ) ?? 0

  const standingsPoints =
    input.groupStandings?.reduce(
      (sum, group) =>
        sum + calculateGroupStandingsPoints(group.predictedTeamIds, group.actualTeamIds).points,
      0
    ) ?? 0

  const bestThirds = input.bestThirds
    ? calculateBestThirdsPoints(input.bestThirds.predictedTeamIds, input.bestThirds.actualTeamIds)
    : {
        points: 0,
        includedTeams: 0,
        qualifiedTeamsBonus: false,
        perfectOrderBonus: false,
      }

  const knockout = input.knockout
    ? calculateKnockoutPoints(input.knockout)
    : {
        progressionPoints: 0,
        podiumPoints: 0,
        matchupPoints: 0,
        points: 0,
        matches: [],
      }

  const specials = input.specials
    ? calculateSpecialPredictionPoints(input.specials.predicted, input.specials.actual)
    : { points: 0 }

  return {
    totalPoints: matchPoints + standingsPoints + bestThirds.points + knockout.points + specials.points,
    groupStage: {
      matchPoints,
      standingsPoints,
      points: matchPoints + standingsPoints,
    },
    bestThirds,
    knockout,
    specials,
  }
}

function calculateKnockoutProgressionPoints(
  predictedMatches: KnockoutMatchPrediction[],
  actualMatches: KnockoutMatchPrediction[]
): number {
  const predictedStages = collectReachedStages(predictedMatches)
  const actualStages = collectReachedStages(actualMatches)

  let points = 0

  for (const [teamId, actualReachedStages] of actualStages.entries()) {
    const predictedReachedStages = predictedStages.get(teamId)
    if (!predictedReachedStages) continue

    if (actualReachedStages.has('r32') && predictedReachedStages.has('r32')) {
      points += SCORING_RULES.KNOCKOUT.PROGRESSION.REACH_R32
    }
    if (actualReachedStages.has('r16') && predictedReachedStages.has('r16')) {
      points += SCORING_RULES.KNOCKOUT.PROGRESSION.REACH_R16
    }
    if (actualReachedStages.has('qf') && predictedReachedStages.has('qf')) {
      points += SCORING_RULES.KNOCKOUT.PROGRESSION.REACH_QF
    }
    if (actualReachedStages.has('sf') && predictedReachedStages.has('sf')) {
      points += SCORING_RULES.KNOCKOUT.PROGRESSION.REACH_SF
    }
    if (actualReachedStages.has('final') && predictedReachedStages.has('final')) {
      points += SCORING_RULES.KNOCKOUT.PROGRESSION.REACH_FINAL
    }
  }

  return points
}

function calculateKnockoutPodiumPoints(
  predictedMatches: KnockoutMatchPrediction[],
  actualMatches: KnockoutMatchPrediction[]
): number {
  const predictedPodium = getPodiumTeams(predictedMatches)
  const actualPodium = getPodiumTeams(actualMatches)

  let points = 0

  if (predictedPodium.championTeamId && predictedPodium.championTeamId === actualPodium.championTeamId) {
    points += SCORING_RULES.KNOCKOUT.PROGRESSION.CHAMPION
  }
  if (predictedPodium.runnerUpTeamId && predictedPodium.runnerUpTeamId === actualPodium.runnerUpTeamId) {
    points += SCORING_RULES.KNOCKOUT.PROGRESSION.RUNNER_UP
  }
  if (predictedPodium.thirdPlaceTeamId && predictedPodium.thirdPlaceTeamId === actualPodium.thirdPlaceTeamId) {
    points += SCORING_RULES.KNOCKOUT.PROGRESSION.THIRD_PLACE
  }

  return points
}

function getPodiumTeams(matches: KnockoutMatchPrediction[]) {
  const finalMatch = matches.find((match) => match.round === 'final')
  const thirdPlaceMatch = matches.find((match) => match.round === '3rd')

  const championTeamId = finalMatch?.winnerTeamId ?? null
  const runnerUpTeamId = finalMatch ? getLoserTeamId(finalMatch) : null
  const thirdPlaceTeamId = thirdPlaceMatch?.winnerTeamId ?? null

  return {
    championTeamId,
    runnerUpTeamId,
    thirdPlaceTeamId,
  }
}

function collectReachedStages(
  matches: KnockoutMatchPrediction[]
): Map<string, Set<KnockoutProgressStage>> {
  const reachedStages = new Map<string, Set<KnockoutProgressStage>>()

  for (const match of matches) {
    if (!isProgressStage(match.round)) continue
    if (match.homeTeamId) addReachedStage(reachedStages, match.homeTeamId, match.round)
    if (match.awayTeamId) addReachedStage(reachedStages, match.awayTeamId, match.round)
  }

  return reachedStages
}

function addReachedStage(
  reachedStages: Map<string, Set<KnockoutProgressStage>>,
  teamId: string,
  stage: KnockoutProgressStage
) {
  const stages = reachedStages.get(teamId) ?? new Set<KnockoutProgressStage>()
  stages.add(stage)
  reachedStages.set(teamId, stages)
}

function getWinner(result: MatchResult): 'home' | 'away' | 'draw' {
  if (result.homeGoals > result.awayGoals) return 'home'
  if (result.awayGoals > result.homeGoals) return 'away'
  return 'draw'
}

function haveSameMembers(left: string[], right: string[]): boolean {
  if (left.length !== right.length) return false

  const leftSorted = [...left].sort()
  const rightSorted = [...right].sort()

  return leftSorted.every((teamId, index) => teamId === rightSorted[index])
}

function getRoundAndPairingKey(match: KnockoutMatchPrediction): string | null {
  if (!match.homeTeamId || !match.awayTeamId) return null
  return `${match.round}:${getPairingKey(match.homeTeamId, match.awayTeamId)}`
}

function getPairingKey(teamA: string, teamB: string): string {
  return [teamA, teamB].sort().join('::')
}

function haveSamePairing(
  left: KnockoutMatchPrediction,
  right: KnockoutMatchPrediction
): boolean {
  if (left.round !== right.round) return false
  if (!left.homeTeamId || !left.awayTeamId || !right.homeTeamId || !right.awayTeamId) return false

  return getPairingKey(left.homeTeamId, left.awayTeamId) === getPairingKey(right.homeTeamId, right.awayTeamId)
}

function isExactScoreAfter120(
  predictedMatch: KnockoutMatchPrediction,
  actualMatch: KnockoutMatchPrediction
): boolean {
  if (
    predictedMatch.homeGoalsAfter120 === null ||
    predictedMatch.homeGoalsAfter120 === undefined ||
    predictedMatch.awayGoalsAfter120 === null ||
    predictedMatch.awayGoalsAfter120 === undefined ||
    actualMatch.homeGoalsAfter120 === null ||
    actualMatch.homeGoalsAfter120 === undefined ||
    actualMatch.awayGoalsAfter120 === null ||
    actualMatch.awayGoalsAfter120 === undefined ||
    !predictedMatch.homeTeamId ||
    !predictedMatch.awayTeamId ||
    !actualMatch.homeTeamId ||
    !actualMatch.awayTeamId
  ) {
    return false
  }

  if (
    predictedMatch.homeTeamId === actualMatch.homeTeamId &&
    predictedMatch.awayTeamId === actualMatch.awayTeamId
  ) {
    return (
      predictedMatch.homeGoalsAfter120 === actualMatch.homeGoalsAfter120 &&
      predictedMatch.awayGoalsAfter120 === actualMatch.awayGoalsAfter120
    )
  }

  if (
    predictedMatch.homeTeamId === actualMatch.awayTeamId &&
    predictedMatch.awayTeamId === actualMatch.homeTeamId
  ) {
    return (
      predictedMatch.homeGoalsAfter120 === actualMatch.awayGoalsAfter120 &&
      predictedMatch.awayGoalsAfter120 === actualMatch.homeGoalsAfter120
    )
  }

  return false
}

function getLoserTeamId(match: KnockoutMatchPrediction): string | null {
  if (!match.winnerTeamId || !match.homeTeamId || !match.awayTeamId) return null
  if (match.winnerTeamId === match.homeTeamId) return match.awayTeamId
  if (match.winnerTeamId === match.awayTeamId) return match.homeTeamId
  return null
}

function sameLooseValue(left?: string | null, right?: string | null): boolean {
  return normalizeLooseValue(left) !== '' && normalizeLooseValue(left) === normalizeLooseValue(right)
}

function sameExactValue(left?: string | null, right?: string | null): boolean {
  return Boolean(left) && Boolean(right) && left === right
}

function normalizeLooseValue(value?: string | null): string {
  return value?.trim().toLocaleLowerCase('es-ES') ?? ''
}

function isProgressStage(round: KnockoutScoringRound): round is KnockoutProgressStage {
  return round === 'r32' || round === 'r16' || round === 'qf' || round === 'sf' || round === 'final'
}
