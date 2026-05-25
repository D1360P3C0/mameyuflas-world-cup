'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { ROUTES } from '@/lib/constants/routes'

type SuccessResult = { success: true }
type ErrorResult = { error: string }
type ActionResult = SuccessResult | ErrorResult

const VALID_FORMATIONS = new Set(['4-3-3', '4-4-2', '4-2-3-1', '3-5-2'])

export async function publishSpainLineupAction(params: {
  formation: string
  slots: Record<string, string>
  note: string
}): Promise<ActionResult> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Debes iniciar sesion para publicar tu XI' }
  }

  if (!VALID_FORMATIONS.has(params.formation)) {
    return { error: 'La formacion seleccionada no es valida' }
  }

  const playerIds = Object.values(params.slots)
  if (playerIds.length !== 11) {
    return { error: 'Tu alineacion debe tener 11 jugadores' }
  }

  if (new Set(playerIds).size !== 11) {
    return { error: 'No puedes repetir jugadores en la alineacion' }
  }

  const { data: squadPlayers } = await supabase
    .from('spain_squad')
    .select('id')
    .in('id', playerIds)
    .eq('is_active', true)

  if ((squadPlayers ?? []).length !== 11) {
    return { error: 'Hay jugadores no validos en tu alineacion' }
  }

  const cleanNote = params.note.trim()

  const { data: existingLineup } = await supabase
    .from('spain_lineups')
    .select('id')
    .eq('user_id', user.id)
    .is('match_id', null)
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (existingLineup) {
    const { error } = await supabase
      .from('spain_lineups')
      .update({
        formation: params.formation,
        slots: params.slots,
        note: cleanNote || null,
        is_published: true,
      })
      .eq('id', existingLineup.id)

    if (error) {
      return { error: 'No se pudo publicar tu alineacion' }
    }
  } else {
    const { error } = await supabase
      .from('spain_lineups')
      .insert({
        user_id: user.id,
        match_id: null,
        formation: params.formation,
        slots: params.slots,
        note: cleanNote || null,
        is_published: true,
      })

    if (error) {
      return { error: 'No se pudo publicar tu alineacion' }
    }
  }

  revalidatePath(ROUTES.DASHBOARD)
  revalidatePath(ROUTES.SPAIN_XI)

  return { success: true }
}
