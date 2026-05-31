/**
 * Admin Partidos — Server Component
 *
 * Carga todos los partidos desde Supabase (con equipos)
 * y los pasa al cliente para edición interactiva.
 */
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { MatchesClient, type AdminMatch } from './MatchesClient'

export const metadata: Metadata = { title: 'Gestión de Partidos · Admin' }

export default async function AdminMatchesPage() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('matches')
    .select(`
      id,
      match_number,
      stage,
      scheduled_at,
      status,
      home_score,
      away_score,
      venue,
      external_fixture_id,
      home_team:teams!matches_home_team_id_fkey ( id, name ),
      away_team:teams!matches_away_team_id_fkey ( id, name )
    `)
    .order('match_number', { ascending: true })

  const matches = (data ?? []) as unknown as AdminMatch[]

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-[#FF5E9F] uppercase">
            Gestión de Partidos
          </h1>
          <p className="font-mono text-[11px] text-white/40 uppercase tracking-widest mt-1">
            {matches.length} partidos · Edita resultados en tiempo real
          </p>
        </div>
        <div className="text-right">
          <p className="font-mono text-[10px] text-white/30">
            Los cambios afectan al scoring inmediatamente
          </p>
        </div>
      </div>

      {error && (
        <p className="mb-4 text-sm text-[#f87171] font-mono">Error: {error.message}</p>
      )}

      {matches.length === 0 && !error ? (
        <div className="glass-card rounded-xl p-12 text-center">
          <p className="font-mono text-white/40 text-sm">No hay partidos cargados en la base de datos.</p>
          <p className="font-mono text-white/20 text-xs mt-2">Ejecuta la migración 003_seed_teams_matches.sql</p>
        </div>
      ) : (
        <MatchesClient matches={matches} />
      )}
    </div>
  )
}
