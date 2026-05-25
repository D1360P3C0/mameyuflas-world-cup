/**
 * Página 404 — Not Found — Ultra-Strike Design.
 */
import Link from 'next/link'
import { ROUTES } from '@/lib/constants/routes'

export default function NotFound() {
  return (
    <main
      className="flex min-h-dvh flex-col items-center justify-center p-8 text-center"
      style={{ background: '#0F0F1E' }}
    >
      <p className="font-heading text-8xl font-extrabold text-[#FF5E9F]/20">404</p>
      <h1 className="mt-2 font-heading text-3xl font-bold uppercase text-white">
        Página no encontrada
      </h1>
      <p className="mt-3 text-white/40">
        Esta página no existe o fue eliminada.
      </p>
      <Link
        href={ROUTES.HOME}
        className="mt-8 rounded-xl bg-[#FF5E9F] px-6 py-2.5 font-heading font-bold uppercase tracking-wide text-white transition-all hover:bg-[#e0447f] hover:shadow-[0_0_20px_rgba(255,94,159,0.4)] active:scale-[0.97]"
      >
        Volver al inicio
      </Link>
    </main>
  )
}
