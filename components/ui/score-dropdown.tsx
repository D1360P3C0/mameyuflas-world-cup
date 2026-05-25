'use client'

/**
 * ScoreDropdown — selector de goles estilizado.
 *
 * Reemplaza el <select> nativo por un dropdown completamente custom:
 *  • Trigger con degradado y glow rosa cuando score > 0
 *  • Panel animado (Framer Motion) que abre HACIA ARRIBA
 *  • 10 opciones (0–9) con resaltado del valor seleccionado
 *  • Cierra al hacer clic fuera o al seleccionar
 */
import { useState, useRef, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { cn } from '@/lib/utils/cn'

const SCORES = Array.from({ length: 10 }, (_, i) => i)

export interface ScoreDropdownProps {
  value: number
  onChange: (value: number) => void
  disabled?: boolean
  /** Resalta en rosa si hay una predicción guardada */
  highlight?: boolean
}

export function ScoreDropdown({
  value,
  onChange,
  disabled = false,
  highlight = false,
}: ScoreDropdownProps) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  /* Cerrar al hacer clic fuera */
  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const active = highlight || open

  return (
    <div ref={containerRef} className="relative select-none">

      {/* ── Trigger ─────────────────────────────────────────── */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen((o) => !o)}
        aria-expanded={open}
        className={cn(
          'relative w-16 h-14 rounded-xl border-2 flex flex-col items-center justify-center gap-0.5',
          'bg-gradient-to-b from-[#3e3d52] to-[#2a2938]',
          'transition-all duration-200',
          active
            ? 'border-[#FF5E9F] shadow-[0_0_16px_rgba(255,94,159,0.28)]'
            : 'border-white/10',
          disabled && 'cursor-not-allowed opacity-50',
          !disabled && 'cursor-pointer active:scale-95',
        )}
      >
        {/* Brillo superior sutil */}
        <span className="pointer-events-none absolute inset-x-0 top-0 h-px rounded-t-xl bg-white/10" />

        {/* Número */}
        <span
          className={cn(
            'font-heading text-2xl font-bold leading-none tabular-nums transition-colors',
            active ? 'text-[#ffb0c9]' : 'text-white',
          )}
        >
          {value}
        </span>

        {/* Chevron con rotación CSS */}
        <span
          className={cn(
            'material-symbols-outlined text-[14px] leading-none transition-all duration-200',
            active ? 'text-[#FF5E9F]/60 rotate-180' : 'text-white/30 rotate-0',
          )}
        >
          expand_more
        </span>
      </button>

      {/* ── Panel de opciones ────────────────────────────────── */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.96 }}
            transition={{ duration: 0.14, ease: 'easeOut' }}
            className={cn(
              'absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50',
              'w-16 max-h-52 overflow-y-auto',
              'rounded-xl border border-white/10',
              'bg-[#1C1B2E] shadow-[0_8px_32px_rgba(0,0,0,0.65)]',
              // Barra de scroll custom (webkit)
              '[&::-webkit-scrollbar]:w-1',
              '[&::-webkit-scrollbar-track]:bg-transparent',
              '[&::-webkit-scrollbar-thumb]:rounded-full',
              '[&::-webkit-scrollbar-thumb]:bg-white/10',
            )}
          >
            {SCORES.map((score, idx) => (
              <button
                key={score}
                type="button"
                onClick={() => { onChange(score); setOpen(false) }}
                className={cn(
                  'w-full py-2.5 text-center font-heading text-lg font-bold transition-colors',
                  /* Separador entre opciones */
                  idx < SCORES.length - 1 && 'border-b border-white/5',
                  score === value
                    ? 'bg-[#FF5E9F]/20 text-[#ffb0c9]'
                    : 'text-white/60 hover:bg-white/5 hover:text-white',
                )}
              >
                {score}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
