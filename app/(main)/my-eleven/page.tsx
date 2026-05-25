/**
 * Mi XI del Mundial — página servidor.
 * Carga el world_squad y el XI guardado del usuario.
 */
import type { Metadata }  from 'next'
import { redirect }       from 'next/navigation'
import { createClient }   from '@/lib/supabase/server'
import { ROUTES }         from '@/lib/constants/routes'
import { MyElevenClient } from './MyElevenClient'

export const metadata: Metadata = { title: 'Mi XI del Mundial' }

type WorldPosition = 'GK' | 'DEF' | 'MID' | 'FWD'

export default async function MyElevenPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(ROUTES.LOGIN)

  const [{ data: squadRaw }, { data: existing }] = await Promise.all([
    supabase
      .from('world_squad')
      .select('id, name, short_name, position, team_id, country_code, dorsal')
      .eq('is_active', true)
      .order('position')
      .order('name'),
    supabase
      .from('my_eleven')
      .select('formation, slots, note, is_published')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
  ])

  const squad = (squadRaw ?? []).map((p) => ({
    id:           p.id,
    name:         p.name,
    short_name:   p.short_name,
    position:     p.position as WorldPosition,
    team_id:      p.team_id,
    country_code: p.country_code,
    dorsal:       p.dorsal ?? null,
  }))

  return (
    <MyElevenClient
      squad={squad}
      initialFormation={existing?.formation ?? '4-3-3'}
      initialSlots={(existing?.slots as Record<string, string> | null) ?? null}
      initialNote={existing?.note ?? ''}
      initialPublished={existing?.is_published ?? false}
    />
  )
}
