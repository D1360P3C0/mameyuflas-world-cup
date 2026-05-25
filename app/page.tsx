/**
 * Landing page pública de MWC — Ultra-Strike Design.
 * Fondo #0F0F1E con glows neon pink y purple.
 * Los usuarios autenticados son redirigidos al dashboard por proxy.ts.
 */
import Link from 'next/link'
import { ROUTES } from '@/lib/constants/routes'

export default function HomePage() {
  return (
    <main
      className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-4 py-16 text-center"
      style={{ background: '#0F0F1E' }}
    >
      {/* Glows decorativos */}
      <div
        className="pointer-events-none absolute -top-32 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(255,94,159,0.12) 0%, transparent 70%)' }}
      />
      <div
        className="pointer-events-none absolute -bottom-32 left-1/4 h-80 w-80 rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.10) 0%, transparent 70%)' }}
      />

      {/* Dot grid */}
      <div className="mwc-dot-grid pointer-events-none absolute inset-0" />

      <div className="mwc-fade-in relative w-full max-w-2xl">

        {/* Badge */}
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#FF5E9F]/30 bg-[#FF5E9F]/10 px-4 py-1.5">
          <span className="mwc-live-dot h-1.5 w-1.5 rounded-full bg-[#00F5FF]" />
          <span className="text-xs font-bold uppercase tracking-widest text-[#FF5E9F]">
            FIFA World Cup 2026
          </span>
        </div>

        {/* Título */}
        <h1 className="font-heading text-5xl font-black uppercase leading-none tracking-tight text-white sm:text-7xl md:text-8xl">
          Mameyuflas
          <br />
          <span className="mwc-text-gradient">World Cup</span>
        </h1>

        {/* Subtítulo */}
        <p className="mx-auto mt-5 max-w-md text-base text-white/50 sm:text-lg">
          La porra más completa del Mundial 2026.
          Predicciones, ligas privadas, Match Center y rankings en tiempo real.
        </p>

        {/* CTAs */}
        <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link
            href={ROUTES.REGISTER}
            className="inline-flex h-11 items-center justify-center rounded-xl bg-[#FF5E9F] px-8 font-heading font-bold uppercase tracking-wide text-white transition-all hover:bg-[#e0447f] hover:shadow-[0_0_24px_rgba(255,94,159,0.5)] active:scale-[0.97]"
          >
            Unirme gratis →
          </Link>
          <Link
            href={ROUTES.LOGIN}
            className="inline-flex h-11 items-center justify-center rounded-xl border border-white/15 px-8 font-heading font-bold uppercase tracking-wide text-white/60 transition-all hover:border-white/30 hover:bg-white/6 hover:text-white"
          >
            Ya tengo cuenta
          </Link>
        </div>

        {/* Features grid */}
        <div className="mt-16 grid grid-cols-2 gap-3 text-left sm:grid-cols-4">
          {[
            { icon: '📊', label: 'Predicciones',   desc: 'Marcadores, grupos, eliminatorias y premios',   color: '#FF5E9F' },
            { icon: '⚽', label: 'Match Center',   desc: 'Datos en vivo con comentarios y estadísticas',  color: '#00F5FF' },
            { icon: '👥', label: 'Ligas privadas', desc: 'Compite con tus amigos en grupos cerrados',      color: '#8B5CF6' },
            { icon: '🏆', label: 'Rankings',       desc: 'Leaderboard global y por liga en tiempo real',  color: '#fbbf24' },
          ].map((f) => (
            <div
              key={f.label}
              className="rounded-2xl border border-white/8 bg-[#1A1A2E] p-4 backdrop-blur transition-all hover:border-white/14"
            >
              <p className="text-2xl">{f.icon}</p>
              <p className="mt-2 text-sm font-bold uppercase tracking-wide text-white">
                {f.label}
              </p>
              <p className="mt-1 text-xs text-white/40">{f.desc}</p>
            </div>
          ))}
        </div>

        {/* Footer */}
        <p className="mt-16 text-xs text-white/25">
          Next.js 15 · Supabase · TanStack Query · Tailwind v4
        </p>
      </div>
    </main>
  )
}
