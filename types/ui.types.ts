/**
 * Tipos de componentes de UI para MWC.
 */
import type { MatchReaction } from '@/lib/constants/ui'

/** Props base para componentes con className customizable */
export type WithClassName = {
  className?: string
}

/** Tamaños estándar de componentes */
export type Size = 'sm' | 'md' | 'lg'

/** Variantes de botón */
export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'

/** Estado de carga genérico */
export type LoadingState = 'idle' | 'loading' | 'success' | 'error'

/** Item de reacción con conteo */
export type ReactionCount = {
  reaction: MatchReaction
  count: number
  userReacted: boolean
}

/** Item de navegación */
export type NavItem = {
  label: string
  href: string
  icon?: React.ComponentType<{ className?: string }>
  badge?: number
}
