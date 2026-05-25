'use client'

/**
 * Error boundary global de Next.js — Ultra-Strike Design.
 */
import Link from 'next/link'
import { ROUTES } from '@/lib/constants/routes'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <main
      className="flex min-h-dvh flex-col items-center justify-center p-8 text-center"
      style={{ background: '#0F0F1E' }}
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#f87171]/12 text-3xl">
        ⚠️
      </div>
      <h1 className="mt-4 font-heading text-3xl font-bold uppercase text-[#f87171]">
        Algo salió mal
      </h1>
      <p className="mt-3 text-sm text-white/40">
        {error.digest && `Error: ${error.digest}`}
      </p>
      <div className="mt-8 flex gap-3">
        <button
          onClick={reset}
          className="rounded-xl bg-[#FF5E9F] px-6 py-2.5 font-heading font-bold uppercase tracking-wide text-white transition-all hover:bg-[#e0447f] hover:shadow-[0_0_20px_rgba(255,94,159,0.4)]"
        >
          Reintentar
        </button>
        <Link
          href={ROUTES.HOME}
          className="rounded-xl border border-white/15 px-6 py-2.5 font-heading font-bold uppercase tracking-wide text-white/50 transition-all hover:border-white/30 hover:text-white"
        >
          Inicio
        </Link>
      </div>
    </main>
  )
}
