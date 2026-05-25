'use server'

import { revalidatePath } from 'next/cache'
import { createClient }   from '@/lib/supabase/server'
import { ROUTES }         from '@/lib/constants/routes'

type SuccessResult = { success: true }
type ErrorResult   = { error: string }
type ActionResult  = SuccessResult | ErrorResult

const VALID_FORMATIONS = new Set(['4-3-3', '4-4-2', '4-2-3-1', '3-5-2'])

export async function saveMyElevenAction(params: {
  formation: string
  slots:     Record<string, string>  // { "GK_0": playerId, ... }
  note:      string
  publish:   boolean
}): Promise<ActionResult> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Debes iniciar sesion para guardar tu XI' }

  if (!VALID_FORMATIONS.has(params.formation)) {
    return { error: 'Formacion no valida' }
  }

  const playerIds = Object.values(params.slots)
  if (playerIds.length !== 11) {
    return { error: 'Tu XI debe tener exactamente 11 jugadores' }
  }
  if (new Set(playerIds).size !== 11) {
    return { error: 'No puedes repetir jugadores' }
  }

  // Validar que todos los jugadores existen en world_squad
  const { data: validPlayers } = await supabase
    .from('world_squad')
    .select('id')
    .in('id', playerIds)
    .eq('is_active', true)

  if ((validPlayers ?? []).length !== 11) {
    return { error: 'Hay jugadores no validos en tu alineacion' }
  }

  const cleanNote = params.note.trim()

  // Upsert: un solo registro por usuario
  const { data: existing } = await supabase
    .from('my_eleven')
    .select('id')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (existing) {
    const { error } = await supabase
      .from('my_eleven')
      .update({
        formation:    params.formation,
        slots:        params.slots,
        note:         cleanNote || null,
        is_published: params.publish,
      })
      .eq('id', existing.id)

    if (error) return { error: 'No se pudo guardar tu XI' }
  } else {
    const { error } = await supabase
      .from('my_eleven')
      .insert({
        user_id:      user.id,
        formation:    params.formation,
        slots:        params.slots,
        note:         cleanNote || null,
        is_published: params.publish,
      })

    if (error) return { error: 'No se pudo guardar tu XI' }
  }

  revalidatePath(ROUTES.MY_ELEVEN)
  revalidatePath(ROUTES.DASHBOARD)
  revalidatePath(ROUTES.FANZONE)

  return { success: true }
}
