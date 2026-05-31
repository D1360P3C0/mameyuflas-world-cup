// Cron job — sincroniza resultados en tiempo real durante los partidos.
// Se activa en Vercel cada 5 minutos (ver vercel.json).
// Actualiza scores al descanso (HT) y al final (FT/AET/PEN).
// Solo procesa partidos con external_fixture_id asignado.

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getFixture } from '@/lib/api/api-football'
import {
  STATUS_HALFTIME,
  STATUS_FULLTIME,
  STATUS_LIVE,
} from '@/lib/constants/api-football'
import type { Database } from '@/types/database.types'

type MatchUpdate = Database['public']['Tables']['matches']['Update']

function getServiceClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
}

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = getServiceClient()
  const now = new Date()

  // Busca partidos que puedan estar en curso:
  // - status = live, o
  // - status = scheduled y empezaron hace menos de 2.5h o empiezan en menos de 15min
  const windowStart = new Date(now.getTime() - 150 * 60 * 1000).toISOString()
  const windowEnd   = new Date(now.getTime() + 15 * 60 * 1000).toISOString()

  const { data: matches, error: fetchError } = await supabase
    .from('matches')
    .select('id, status, external_fixture_id, halftime_checked_at, fulltime_checked_at')
    .not('external_fixture_id', 'is', null)
    .or(
      `status.eq.live,and(status.eq.scheduled,scheduled_at.gte.${windowStart},scheduled_at.lte.${windowEnd})`,
    )

  if (fetchError) {
    return NextResponse.json({ error: fetchError.message }, { status: 500 })
  }
  if (!matches?.length) {
    return NextResponse.json({ synced: 0, message: 'No hay partidos activos' })
  }

  let synced = 0
  const errors: string[] = []

  for (const match of matches) {
    try {
      const fixture = await getFixture(match.external_fixture_id!)
      if (!fixture) continue

      const statusShort = fixture.fixture.status.short
      const nowIso = now.toISOString()
      const update: MatchUpdate = { last_external_sync_at: nowIso }
      let shouldUpdate = false

      // Transición a live
      if (STATUS_LIVE.includes(statusShort) && match.status !== 'live') {
        update.status = 'live'
        shouldUpdate = true
      }

      // Actualizar marcador parcial
      if (fixture.goals.home !== null) {
        update.home_score = fixture.goals.home
        update.away_score = fixture.goals.away
        shouldUpdate = true
      }

      // Descanso — guardar el marcador del primer tiempo
      if (STATUS_HALFTIME.includes(statusShort) && !match.halftime_checked_at) {
        update.halftime_checked_at = nowIso
        shouldUpdate = true
      }

      // Final del partido
      if (STATUS_FULLTIME.includes(statusShort)) {
        update.status = 'finished'
        shouldUpdate = true
        if (!match.fulltime_checked_at) {
          update.fulltime_checked_at = nowIso
          // Prórroga
          if (fixture.score.extratime.home !== null) {
            update.home_score_et = fixture.score.extratime.home
            update.away_score_et = fixture.score.extratime.away
          }
          // Penaltis
          if (fixture.score.penalty.home !== null) {
            update.home_score_pens = fixture.score.penalty.home
            update.away_score_pens = fixture.score.penalty.away
          }
        }
      }

      if (!shouldUpdate) continue

      const { error } = await supabase.from('matches').update(update).eq('id', match.id)
      if (error) errors.push(`${match.id}: ${error.message}`)
      else synced++
    } catch (e) {
      errors.push(e instanceof Error ? e.message : 'Error desconocido')
    }
  }

  return NextResponse.json({
    synced,
    checked: matches.length,
    errors: errors.length ? errors : undefined,
    ts: now.toISOString(),
  })
}
