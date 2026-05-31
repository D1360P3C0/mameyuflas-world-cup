'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils/cn'

export function HomeRulesDialog() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!open) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }

    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKeyDown)

    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex h-11 items-center justify-center rounded-xl border border-[#00F5FF]/20 bg-[#00F5FF]/8 px-6 font-heading font-bold uppercase tracking-wide text-[#9BE7FF] transition-all hover:border-[#00F5FF]/40 hover:bg-[#00F5FF]/12 hover:text-white"
      >
        Reglas del juego
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#050510]/82 px-4 py-8 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <div
            className="relative w-full max-w-3xl overflow-hidden rounded-[28px] border border-white/10 bg-[#10101F] shadow-[0_20px_80px_rgba(0,0,0,0.55)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#FF5E9F]/70 to-transparent" />

            <div className="flex items-start justify-between gap-4 border-b border-white/8 px-6 py-5">
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-[#FF5E9F]">
                  Modo Clasico
                </p>
                <h2 className="mt-1 font-heading text-3xl font-black uppercase text-white">
                  Reglas del juego
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setOpen(false)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-white/60 transition hover:border-white/20 hover:text-white"
                aria-label="Cerrar"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="max-h-[75vh] space-y-6 overflow-y-auto px-6 py-6 text-left">
              <RuleBlock
                title="Cierre de predicciones"
                accent="pink"
                items={[
                  'Todo se rellena antes del primer partido del Mundial.',
                  'Puedes completar grupos, mejores terceras, eliminatorias y extras hasta el inicio del torneo.',
                  'Cuando empieza el Mundial, toda la prediccion queda cerrada.',
                ]}
              />

              <RuleBlock
                title="Fase 1 · Grupos"
                accent="cyan"
                subtitle="Maximo 600 pts"
                items={[
                  'Partidos: 8 pts por marcador exacto, 4 pts por ganador o empate, 2 pts por goles exactos de un solo equipo.',
                  'Solo cuenta la mejor categoria por partido. Maximo de partidos: 384 pts.',
                  'Clasificacion final: 18 pts si clavas el 1. al 4., 12 pts si aciertas los dos clasificados en orden, 8 pts si aciertas los dos sin orden, 4 pts si solo aciertas el ganador.',
                  'Solo cuenta la mejor categoria por grupo. Maximo de clasificaciones: 216 pts.',
                ]}
              />

              <RuleBlock
                title="Fase 2 · Mejores terceras"
                accent="violet"
                subtitle="Maximo 30 pts"
                items={[
                  '2 puntos por cada tercera real incluida en tu top 8.',
                  '6 puntos extra si aciertas las 8 terceras clasificadas.',
                  '8 puntos extra si ademas clavas el orden del 1 al 8.',
                ]}
              />

              <RuleBlock
                title="Fase 3 · Eliminatorias"
                accent="gold"
                subtitle="Maximo 1.055 pts"
                items={[
                  'Progresion por seleccion: 2 pts en dieciseisavos, 5 en octavos, 10 en cuartos, 18 en semis y 30 en final.',
                  'Podio exacto: 100 pts campeona, 50 subcampeona, 25 tercera.',
                  'Cruces reales: puntos por emparejamiento, clasificado y marcador tras 120 minutos. El valor sube ronda a ronda hasta 29 pts en la final.',
                ]}
              />

              <RuleBlock
                title="Extras del torneo"
                accent="pink"
                subtitle="Maximo 126 pts"
                items={[
                  '30 pts maximo goleador.',
                  '24 pts MVP.',
                  '24 pts seleccion revelacion.',
                  '18 pts mejor portero.',
                  '15 pts seleccion mas goleadora en grupos.',
                  '15 pts seleccion menos goleada en grupos.',
                ]}
              />

              <div className="rounded-2xl border border-[#FF5E9F]/20 bg-[#FF5E9F]/8 px-4 py-4">
                <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[#ffb0c9]">
                  Puntuacion maxima total
                </p>
                <p className="mt-2 font-heading text-4xl font-black text-white">1.685 puntos</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

function RuleBlock({
  title,
  subtitle,
  items,
  accent,
}: {
  title: string
  subtitle?: string
  items: string[]
  accent: 'pink' | 'cyan' | 'violet' | 'gold'
}) {
  return (
    <section className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="font-heading text-xl font-bold uppercase text-white">{title}</h3>
        {subtitle && (
          <span className={cn('rounded-full border px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-widest', badgeClassName(accent))}>
            {subtitle}
          </span>
        )}
      </div>

      <div className="space-y-2">
        {items.map((item) => (
          <p key={item} className="text-sm leading-6 text-white/72">
            {item}
          </p>
        ))}
      </div>
    </section>
  )
}

function badgeClassName(accent: 'pink' | 'cyan' | 'violet' | 'gold') {
  if (accent === 'cyan') return 'border-[#00F5FF]/25 bg-[#00F5FF]/10 text-[#9BE7FF]'
  if (accent === 'violet') return 'border-[#8B5CF6]/25 bg-[#8B5CF6]/10 text-[#D4C2FF]'
  if (accent === 'gold') return 'border-[#FBBF24]/25 bg-[#FBBF24]/10 text-[#FDE68A]'
  return 'border-[#FF5E9F]/25 bg-[#FF5E9F]/10 text-[#ffb0c9]'
}
