/**
 * XI España — página servidor.
 * Carga el squad de Supabase y delega al cliente interactivo.
 */
import type { Metadata } from 'next'
import { redirect }      from 'next/navigation'
import { createClient }  from '@/lib/supabase/server'
import { ROUTES }        from '@/lib/constants/routes'
import { SpainXIClient } from './SpainXIClient'

type SpainPosition = 'GK' | 'DEF' | 'MID' | 'FWD'

export const metadata: Metadata = { title: 'XI España' }

export default async function SpainXIPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(ROUTES.LOGIN)

  const { data: squad } = await supabase
    .from('spain_squad')
    .select('*')
    .eq('is_active', true)
    .order('position')
    .order('dorsal')

  const normalizedSquad = (squad ?? []).map((player) => ({
    ...player,
    position: player.position as SpainPosition,
    caps: player.caps ?? 0,
  }))

  return (
    <SpainXIClient squad={normalizedSquad} />
  )
}
