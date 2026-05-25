/**
 * Componente Spinner — MWC Ultra-Strike Design System
 * Indicador de carga circular. Pink por defecto.
 *
 * Uso:
 *   <Spinner />
 *   <Spinner size="lg" className="text-[#8B5CF6]" />
 */
import { cn } from '@/lib/utils/cn'

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
  label?: string
}

const sizeMap = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
}

export function Spinner({ size = 'md', className, label = 'Cargando...' }: SpinnerProps) {
  return (
    <svg
      className={cn('animate-spin text-[#FF5E9F]', sizeMap[size], className)}
      viewBox="0 0 24 24"
      fill="none"
      role="status"
      aria-label={label}
    >
      <circle
        className="opacity-20"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-80"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  )
}

/** Overlay de pantalla completa con spinner centrado */
export function FullPageSpinner() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-[#0F0F1E]">
      <Spinner size="lg" />
    </div>
  )
}
