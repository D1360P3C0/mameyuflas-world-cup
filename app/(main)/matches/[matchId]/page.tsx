/**
 * Match Center — Página individual de partido.
 * FASE 0: Placeholder.
 * FASE 3: Implementar marcador en tiempo real, eventos, estadísticas y comentarios.
 */
import type { Metadata } from 'next'

type Props = {
  params: Promise<{ matchId: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { matchId } = await params
  return { title: `Partido ${matchId}` }
}

export default async function MatchCenterPage({ params }: Props) {
  const { matchId } = await params

  return (
    <div className="rounded-2xl border border-white/8 bg-[#1A1A2E] p-8">
      <h1 className="font-heading text-3xl font-bold uppercase text-[#00F5FF]">
        Match Center
      </h1>
      <p className="mt-2 text-sm text-white/40">ID: {matchId}</p>
      <p className="mt-3 text-white/40">
        Marcador en tiempo real, eventos, estadísticas y comentarios — disponible en FASE 3
      </p>
    </div>
  )
}
