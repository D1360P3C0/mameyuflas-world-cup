/**
 * Perfil público de un usuario.
 * FASE 0: Placeholder.
 * FASE 1: Implementar perfil con estadísticas y predicciones públicas.
 */
import type { Metadata } from 'next'

type Props = {
  params: Promise<{ userId: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { userId } = await params
  return { title: `Perfil ${userId}` }
}

export default async function UserProfilePage({ params }: Props) {
  const { userId } = await params

  return (
    <div className="rounded-2xl border border-white/8 bg-[#1A1A2E] p-8">
      <h1 className="font-heading text-3xl font-bold uppercase text-[#FF5E9F]">
        Perfil
      </h1>
      <p className="mt-2 text-sm text-white/40">ID: {userId}</p>
      <p className="mt-3 text-white/40">
        Perfil de usuario con estadísticas — disponible en FASE 1
      </p>
    </div>
  )
}
