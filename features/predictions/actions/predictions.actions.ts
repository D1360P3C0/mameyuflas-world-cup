'use server'

/**
 * Server Actions de predicciones.
 *
 * upsertPredictionAction      → guarda o actualiza el marcador de un partido
 * upsertSpecialPredictionsAction → guarda las predicciones de torneo
 *
 * Ambas comprueban autenticación y bloqueo antes de tocar la DB.
 */
import { createClient } from '@/lib/supabase/server'
import {
  bestThirdPredictionSchema,
  groupStandingPredictionSchema,
  knockoutPredictionSchema,
  matchPredictionSchema,
} from '@/lib/validations/prediction.schemas'
import { isPredictionLocked, areSpecialPredictionsLocked } from '../utils/prediction.utils'

type SuccessResult = { success: true }
type ErrorResult   = { error: string }
type ActionResult  = SuccessResult | ErrorResult

// -----------------------------------------------
// Guardar / actualizar predicción de un partido
// -----------------------------------------------
export async function upsertPredictionAction(
  matchId: string,
  homeScore: number,
  awayScore: number,
): Promise<ActionResult> {
  const parsed = matchPredictionSchema.safeParse({
    matchId,
    homeGoals: homeScore,
    awayGoals: awayScore,
  })
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Datos inválidos' }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No estás autenticado' }

  // Verificar que el partido existe y no está bloqueado
  const { data: match } = await supabase
    .from('matches')
    .select('scheduled_at, status')
    .eq('id', matchId)
    .single()

  if (!match) return { error: 'Partido no encontrado' }
  if (isPredictionLocked(match)) {
    return { error: 'Las predicciones para este partido están cerradas' }
  }

  const { error } = await supabase
    .from('predictions')
    .upsert(
      {
        user_id:    user.id,
        match_id:   matchId,
        home_score: homeScore,
        away_score: awayScore,
      },
      { onConflict: 'user_id,match_id' },
    )

  if (error) return { error: 'Error al guardar la predicción' }
  return { success: true }
}

// -----------------------------------------------
// Guardar / actualizar predicciones especiales
// -----------------------------------------------
export async function upsertSpecialPredictionsAction(data: {
  champion_team_id?:  string | null
  runner_up_team_id?: string | null
  revelation_team_id?: string | null
  top_scorer?:        string | null
  top_assist_player?: string | null
  mvp?:               string | null
  best_goalkeeper?:   string | null
  best_young_player?: string | null
  most_goals_in_groups_team_id?: string | null
  fewest_goals_against_in_groups_team_id?: string | null
}): Promise<ActionResult> {
  if (areSpecialPredictionsLocked()) {
    return { error: 'Las predicciones especiales están cerradas' }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No estás autenticado' }

  const { error } = await supabase
    .from('special_predictions')
    .upsert(
      { user_id: user.id, ...data },
      { onConflict: 'user_id' },
    )

  if (error) return { error: 'Error al guardar las predicciones especiales' }
  return { success: true }
}

// -----------------------------------------------
// Guardar / actualizar ganador de un cruce knockout
// -----------------------------------------------
export async function upsertKnockoutPredictionAction(
  matchId: string,
  winnerTeamId: string,
  homeGoalsAfter120?: number | null,
  awayGoalsAfter120?: number | null,
): Promise<ActionResult> {
  const parsed = knockoutPredictionSchema.safeParse({
    matchId,
    winnerTeamId,
    homeGoalsAfter120,
    awayGoalsAfter120,
  })
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Datos invalidos' }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No estas autenticado' }

  const { data: match } = await supabase
    .from('matches')
    .select('id, scheduled_at, status, stage')
    .eq('id', matchId)
    .single()

  if (!match) return { error: 'Cruce no encontrado' }
  if (match.stage === 'group') return { error: 'Este partido no pertenece al bracket' }
  if (isPredictionLocked(match)) {
    return { error: 'Las predicciones para este cruce estan cerradas' }
  }

  const { data: team } = await supabase
    .from('teams')
    .select('id')
    .eq('id', winnerTeamId)
    .single()

  if (!team) return { error: 'Equipo invalido' }

  const { error } = await supabase
    .from('knockout_predictions')
    .upsert(
      {
        user_id: user.id,
        match_id: matchId,
        winner_team_id: winnerTeamId,
        home_score_after_120: homeGoalsAfter120 ?? null,
        away_score_after_120: awayGoalsAfter120 ?? null,
      },
      { onConflict: 'user_id,match_id' },
    )

  if (error) return { error: 'Error al guardar el bracket' }
  return { success: true }
}

export async function clearKnockoutPredictionAction(
  matchId: string,
): Promise<ActionResult> {
  const parsedMatchId = matchPredictionSchema.shape.matchId.safeParse(matchId)
  if (!parsedMatchId.success) {
    return { error: parsedMatchId.error.issues[0]?.message ?? 'Datos invalidos' }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No estas autenticado' }

  const { error } = await supabase
    .from('knockout_predictions')
    .delete()
    .eq('user_id', user.id)
    .eq('match_id', matchId)

  if (error) return { error: 'No se pudo limpiar el pick del bracket' }
  return { success: true }
}

export async function upsertGroupStandingPredictionAction(
  groupLetter: string,
  orderedTeamIds: string[],
): Promise<ActionResult> {
  const parsed = groupStandingPredictionSchema.safeParse({
    groupLetter,
    orderedTeamIds,
  })
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Datos invalidos' }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No estas autenticado' }
  if (areSpecialPredictionsLocked()) {
    return { error: 'Las predicciones clasicas estan cerradas' }
  }

  const [firstTeamId, secondTeamId, thirdTeamId, fourthTeamId] = parsed.data.orderedTeamIds

  const { error } = await supabase
    .from('group_standing_predictions')
    .upsert(
      {
        user_id: user.id,
        group_letter: parsed.data.groupLetter,
        first_team_id: firstTeamId,
        second_team_id: secondTeamId,
        third_team_id: thirdTeamId,
        fourth_team_id: fourthTeamId,
      },
      { onConflict: 'user_id,group_letter' },
    )

  if (error) return { error: 'Error al guardar la clasificacion del grupo' }
  return { success: true }
}

export async function upsertBestThirdPredictionsAction(
  orderedTeamIds: string[],
): Promise<ActionResult> {
  const parsed = bestThirdPredictionSchema.safeParse({ orderedTeamIds })
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Datos invalidos' }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No estas autenticado' }
  if (areSpecialPredictionsLocked()) {
    return { error: 'Las predicciones clasicas estan cerradas' }
  }

  const { error: deleteError } = await supabase
    .from('best_third_predictions')
    .delete()
    .eq('user_id', user.id)

  if (deleteError) return { error: 'Error al actualizar el ranking de terceras' }

  const rows = parsed.data.orderedTeamIds.map((teamId, index) => ({
    user_id: user.id,
    ranking_position: index + 1,
    team_id: teamId,
  }))

  const { error: insertError } = await supabase
    .from('best_third_predictions')
    .insert(rows)

  if (insertError) return { error: 'Error al guardar el ranking de terceras' }
  return { success: true }
}
