/**
 * Página de liga privada individual.
 * FASE 0: Placeholder.
 * FASE 4: Implementar vista de liga con leaderboard y miembros.
 */
import type { Metadata } from 'next'

type Props = {
  params: Promise<{ leagueId: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { leagueId } = await params
  return { title: `Liga ${leagueId}` }
}

export default async function LeaguePage({ params }: Props) {
  const { leagueId } = await params

  return (
    <div className="rounded-2xl border border-white/8 bg-[#1A1A2E] p-8">
      <h1 className="font-heading text-3xl font-bold uppercase text-[#FF5E9F]">
        Liga
      </h1>
      <p className="mt-2 text-sm text-white/40">ID: {leagueId}</p>
      <p className="mt-3 text-white/40">
        Vista de liga con leaderboard y miembros — disponible en FASE 4
      </p>
    </div>
  )
}
