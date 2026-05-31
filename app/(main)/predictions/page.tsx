/**
 * Página de Predicciones — FASE 2
 * Server Component: carga datos y pasa al shell cliente.
 */
import type { Metadata } from 'next'
import { redirect }      from 'next/navigation'
import { createClient }  from '@/lib/supabase/server'
import { ROUTES }        from '@/lib/constants/routes'
import { PredictionsClient } from '@/features/predictions'
import type { CachedTournamentStat, MatchWithTeams } from '@/types/app.types'
import type { Tables } from '@/types/database.types'

export const metadata: Metadata = { title: 'Predicciones' }

// Revalidar cada 60s para reflejar cambios de estado de partidos
export const revalidate = 60

export default async function PrediccionesPage() {
  const supabase = await createClient()

  // Verificar sesión
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(ROUTES.LOGIN)

  const [
    { data: matchesRaw },
    { data: predictions },
    { data: knockoutPredictions },
    { data: groupStandingPredictions },
    { data: bestThirdPredictions },
    { data: specialPrediction },
    { data: tournamentStatsCache },
    { data: teams },
    { data: players },
  ] = await Promise.all([
    supabase
      .from('matches')
      .select(`
        *,
        home_team:teams!matches_home_team_id_fkey ( * ),
        away_team:teams!matches_away_team_id_fkey ( * )
      `)
      .order('match_number'),
    supabase
      .from('predictions')
      .select('*')
      .eq('user_id', user.id),
    supabase
      .from('knockout_predictions')
      .select('*')
      .eq('user_id', user.id),
    supabase
      .from('group_standing_predictions')
      .select('*')
      .eq('user_id', user.id),
    supabase
      .from('best_third_predictions')
      .select('*')
      .eq('user_id', user.id)
      .order('ranking_position'),
    supabase
      .from('special_predictions')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle(),
    supabase
      .from('tournament_stats_cache')
      .select('key, payload, updated_at'),
    supabase
      .from('teams')
      .select('*')
      .order('name'),
    supabase
      .from('world_squad')
      .select('id, name, position, team_id')
      .eq('is_active', true)
      .order('name'),
  ])

  return (
    <PredictionsClient
      matches={(matchesRaw ?? []) as MatchWithTeams[]}
      predictions={(predictions ?? []) as Tables<'predictions'>[]}
      knockoutPredictions={(knockoutPredictions ?? []) as Tables<'knockout_predictions'>[]}
      groupStandingPredictions={(groupStandingPredictions ?? []) as Tables<'group_standing_predictions'>[]}
      bestThirdPredictions={(bestThirdPredictions ?? []) as Tables<'best_third_predictions'>[]}
      specialPrediction={specialPrediction ?? null}
      tournamentStatsCache={(tournamentStatsCache ?? []) as CachedTournamentStat[]}
      teams={teams ?? []}
      players={players ?? []}
    />
  )
}
