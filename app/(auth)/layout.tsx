/**
 * Layout para páginas de autenticación — Ultra-Strike Design.
 * Fondo #0F0F1E con glow radial pink en la esquina superior.
 * Centrado, sin navbar ni sidebar.
 */
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Acceso',
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div
      className="relative flex min-h-dvh flex-col items-center justify-center p-4 overflow-hidden"
      style={{ background: '#0F0F1E' }}
    >
      {/* Glow decorativo pink — esquina superior derecha */}
      <div
        className="pointer-events-none absolute -top-40 -right-40 h-80 w-80 rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(255,94,159,0.18) 0%, transparent 70%)' }}
      />
      {/* Glow decorativo purple — esquina inferior izquierda */}
      <div
        className="pointer-events-none absolute -bottom-40 -left-40 h-80 w-80 rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)' }}
      />

      {/* Dot grid sutil */}
      <div className="mwc-dot-grid pointer-events-none absolute inset-0 opacity-100" />

      {/* Logo arriba */}
      <div className="relative mb-8 flex flex-col items-center gap-3">
        <div
          className="flex h-14 w-14 items-center justify-center rounded-2xl text-3xl"
          style={{
            background: 'linear-gradient(135deg, #FF5E9F, #8B5CF6)',
            boxShadow: '0 0 32px rgba(255,94,159,0.4), 0 0 64px rgba(139,92,246,0.2)',
          }}
        >
          ⚽
        </div>
        <div className="text-center">
          <p className="font-heading text-2xl font-black uppercase tracking-wider text-white">
            MWC 2026
          </p>
          <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-white/35">
            Mameyuflas World Cup
          </p>
        </div>
      </div>

      {/* Card de contenido */}
      <div className="relative w-full max-w-sm">
        {children}
      </div>
    </div>
  )
}
