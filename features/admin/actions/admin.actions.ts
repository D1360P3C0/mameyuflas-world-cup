'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { getFixture, getAllFixtures } from '@/lib/api/api-football'
import {
  FIFA_TO_API_NAME,
  WC2026_LEAGUE_ID,
  WC2026_SEASON,
  STATUS_LIVE,
  STATUS_HALFTIME,
  STATUS_FULLTIME,
} from '@/lib/constants/api-football'
import type { Database } from '@/types/database.types'

type MatchUpdate = Database['public']['Tables']['matches']['Update']

/* ── Helper: verifica que el llamante sea admin ──────────────── */
async function ensureAdmin() {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    throw new Error('No autenticado')
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (profileError || !profile?.is_admin) {
    throw new Error('Acceso denegado — no eres admin')
  }

  return supabase
}

/* ── Partidos ────────────────────────────────────────────────── */

/**
 * Actualiza el resultado y estado de un partido.
 * Puede recibir null en los scores (ej. partido aún no jugado).
 */
export async function updateMatchResultAction(
  matchId: string,
  homeScore: number | null,
  awayScore: number | null,
  status: string,
): Promise<{ success: true } | { error: string }> {
  try {
    const supabase = await ensureAdmin()

    const { error } = await supabase
      .from('matches')
      .update({ home_score: homeScore, away_score: awayScore, status })
      .eq('id', matchId)

    if (error) return { error: error.message }

    revalidatePath('/admin/matches')
    revalidatePath('/')
    revalidatePath('/predictions')
    return { success: true }
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Error desconocido' }
  }
}

/* ── Sync con API-Football ───────────────────────────────────── */

/**
 * Sincroniza el resultado de un partido concreto desde API-Football.
 * Requiere que el partido tenga external_fixture_id definido.
 */
export async function syncMatchFromApiAction(
  matchId: string,
): Promise<{ success: true; message: string } | { error: string }> {
  try {
    const supabase = await ensureAdmin()

    const { data: match, error: fetchError } = await supabase
      .from('matches')
      .select('id, external_fixture_id, status, halftime_checked_at, fulltime_checked_at')
      .eq('id', matchId)
      .single()

    if (fetchError || !match) return { error: 'Partido no encontrado' }
    if (!match.external_fixture_id)
      return { error: 'Sin ID externo — usa "Mapear todos" o asígnalo manualmente' }

    const fixture = await getFixture(match.external_fixture_id)
    if (!fixture) return { error: 'Fixture no encontrado en API-Football' }

    const statusShort = fixture.fixture.status.short
    const now = new Date().toISOString()

    const update: MatchUpdate = {
      last_external_sync_at: now,
      home_score: fixture.goals.home,
      away_score: fixture.goals.away,
    }

    if (STATUS_LIVE.includes(statusShort) && match.status !== 'live') {
      update.status = 'live'
    }

    if (STATUS_HALFTIME.includes(statusShort) && !match.halftime_checked_at) {
      update.halftime_checked_at = now
    }

    if (STATUS_FULLTIME.includes(statusShort)) {
      update.status = 'finished'
      if (!match.fulltime_checked_at) {
        update.fulltime_checked_at = now
      }
      if (fixture.score.extratime.home !== null) {
        update.home_score_et = fixture.score.extratime.home
        update.away_score_et = fixture.score.extratime.away
      }
      if (fixture.score.penalty.home !== null) {
        update.home_score_pens = fixture.score.penalty.home
        update.away_score_pens = fixture.score.penalty.away
      }
    }

    const { error } = await supabase.from('matches').update(update).eq('id', matchId)
    if (error) return { error: error.message }

    revalidatePath('/admin/matches')
    revalidatePath('/')
    revalidatePath('/predictions')

    const scoreStr =
      fixture.goals.home !== null ? `${fixture.goals.home}–${fixture.goals.away}` : 'sin goles'
    return { success: true, message: `${statusShort} · ${scoreStr}` }
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Error desconocido' }
  }
}

/**
 * Asigna manualmente el external_fixture_id de un partido.
 */
export async function setMatchExternalIdAction(
  matchId: string,
  externalFixtureId: number,
): Promise<{ success: true } | { error: string }> {
  try {
    const supabase = await ensureAdmin()
    const { error } = await supabase
      .from('matches')
      .update({ external_fixture_id: externalFixtureId })
      .eq('id', matchId)
    if (error) return { error: error.message }
    revalidatePath('/admin/matches')
    return { success: true }
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Error desconocido' }
  }
}

/**
 * Descarga todos los fixtures del Mundial 2026 desde API-Football
 * y trata de emparejarlos automáticamente con los partidos de la BD
 * comparando fecha (mismo día) + nombre de equipos.
 */
export async function mapAllFixturesAction(): Promise<
  { success: true; mapped: number; skipped: number; unmatched: number } | { error: string }
> {
  try {
    const supabase = await ensureAdmin()

    const { data: matches, error: matchesError } = await supabase
      .from('matches')
      .select('id, scheduled_at, home_team_id, away_team_id, external_fixture_id')

    if (matchesError) return { error: matchesError.message }

    const apiFixtures = await getAllFixtures(WC2026_LEAGUE_ID, WC2026_SEASON)

    let mapped = 0
    let skipped = 0
    let unmatched = 0

    for (const match of matches ?? []) {
      if (match.external_fixture_id) {
        skipped++
        continue
      }

      const homeApiName = FIFA_TO_API_NAME[match.home_team_id ?? '']
      const awayApiName = FIFA_TO_API_NAME[match.away_team_id ?? '']

      if (!homeApiName || !awayApiName) {
        unmatched++
        continue
      }

      const matchDay = new Date(match.scheduled_at).toDateString()

      const apiMatch = apiFixtures.find((f) => {
        const apiDay = new Date(f.fixture.date).toDateString()
        const homeMatch =
          f.teams.home.name === homeApiName ||
          f.teams.home.name.toLowerCase().includes(homeApiName.toLowerCase())
        const awayMatch =
          f.teams.away.name === awayApiName ||
          f.teams.away.name.toLowerCase().includes(awayApiName.toLowerCase())
        return apiDay === matchDay && homeMatch && awayMatch
      })

      if (!apiMatch) {
        unmatched++
        continue
      }

      const { error } = await supabase
        .from('matches')
        .update({ external_fixture_id: apiMatch.fixture.id })
        .eq('id', match.id)

      if (!error) mapped++
      else unmatched++
    }

    revalidatePath('/admin/matches')
    return { success: true, mapped, skipped, unmatched }
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Error de red o API' }
  }
}

/* ── Usuarios ────────────────────────────────────────────────── */

/**
 * Suma o resta puntos bonus a un usuario.
 * El valor resultante no puede bajar de -999 ni superar 999.
 */
export async function updateUserBonusPointsAction(
  userId: string,
  delta: number,
): Promise<{ success: true; newPoints: number } | { error: string }> {
  try {
    const supabase = await ensureAdmin()

    const { data: profile, error: fetchError } = await supabase
      .from('profiles')
      .select('bonus_points')
      .eq('id', userId)
      .single()

    if (fetchError) return { error: fetchError.message }

    const current = profile.bonus_points ?? 0
    const newPoints = Math.max(-999, Math.min(999, current + delta))

    const { error } = await supabase
      .from('profiles')
      .update({ bonus_points: newPoints })
      .eq('id', userId)

    if (error) return { error: error.message }

    revalidatePath('/admin/users')
    revalidatePath('/leaderboard')
    return { success: true, newPoints }
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Error desconocido' }
  }
}

/**
 * Activa o desactiva el veto del tablón para un usuario.
 */
export async function setBanFanzoneAction(
  userId: string,
  banned: boolean,
): Promise<{ success: true } | { error: string }> {
  try {
    const supabase = await ensureAdmin()

    const { error } = await supabase
      .from('profiles')
      .update({ is_banned_fanzone: banned })
      .eq('id', userId)

    if (error) return { error: error.message }

    revalidatePath('/admin/users')
    return { success: true }
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Error desconocido' }
  }
}

/**
 * Marca o desmarca a un usuario como participante con dinero.
 */
export async function setPaysEntryAction(
  userId: string,
  pays: boolean,
): Promise<{ success: true } | { error: string }> {
  try {
    const supabase = await ensureAdmin()

    const { error } = await supabase
      .from('profiles')
      .update({ pays_entry: pays })
      .eq('id', userId)

    if (error) return { error: error.message }

    revalidatePath('/admin/users')
    return { success: true }
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Error desconocido' }
  }
}
