'use server'

/**
 * Server Actions del panel de administración.
 *
 * Todas las acciones verifican que el usuario que llama sea admin
 * antes de ejecutar cualquier operación en la base de datos.
 *
 * Las operaciones sobre partidos están permitidas por la política
 * RLS "matches_admin_all" (ya existente en la BD).
 * Las operaciones sobre perfiles de otros usuarios requieren
 * la política "profiles_update_admin" (migración 010).
 */
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

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
