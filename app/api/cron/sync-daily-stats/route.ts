// Cron job — sincroniza goleadores y asistentes del Mundial 2026.
// Se activa en Vercel a las 23:45 UTC cada día (ver vercel.json).
// Guarda los resultados en tournament_stats_cache para uso en la UI.

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getTopScorers, getTopAssists } from '@/lib/api/api-football'
import { WC2026_LEAGUE_ID, WC2026_SEASON } from '@/lib/constants/api-football'
import type { Database, Json } from '@/types/database.types'

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
  const now = new Date().toISOString()
  const results: Record<string, string> = {}

  // Top goleadores
  try {
    const scorers = await getTopScorers(WC2026_LEAGUE_ID, WC2026_SEASON)
    const { error } = await supabase
      .from('tournament_stats_cache')
      .upsert({ key: 'top_scorers', payload: scorers as unknown as Json, updated_at: now })
    results.top_scorers = error ? `error: ${error.message}` : `ok (${scorers.length})`
  } catch (e) {
    results.top_scorers = `error: ${e instanceof Error ? e.message : 'desconocido'}`
  }

  // Top asistentes
  try {
    const assists = await getTopAssists(WC2026_LEAGUE_ID, WC2026_SEASON)
    const { error } = await supabase
      .from('tournament_stats_cache')
      .upsert({ key: 'top_assists', payload: assists as unknown as Json, updated_at: now })
    results.top_assists = error ? `error: ${error.message}` : `ok (${assists.length})`
  } catch (e) {
    results.top_assists = `error: ${e instanceof Error ? e.message : 'desconocido'}`
  }

  const hasErrors = Object.values(results).some((v) => v.startsWith('error'))
  return NextResponse.json({ success: !hasErrors, results, ts: now })
}
