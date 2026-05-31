/**
 * Predicciones Especiales — diseño Stitch exacto.
 * Bento grid: Máximo Goleador · Guante de Oro · Finalistas · Campeón
 * Usa el mismo action de guardado que la pestaña especiales anterior.
 */
import type { Metadata } from 'next'
import { redirect }      from 'next/navigation'
import { createClient }  from '@/lib/supabase/server'
import { ROUTES }        from '@/lib/constants/routes'
import { SpecialsClient } from './SpecialsClient'

export const metadata: Metadata = { title: 'Especiales' }

export default async function SpecialsPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(ROUTES.LOGIN)

  const [{ data: specialPrediction }, { data: teams }, { data: players }] = await Promise.all([
    supabase
      .from('special_predictions')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle(),
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
    <SpecialsClient
      initialPrediction={specialPrediction ?? null}
      teams={teams ?? []}
      players={players ?? []}
    />
  )
}
