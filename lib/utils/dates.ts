/**
 * Helpers de fechas para MWC.
 * Usa date-fns v4. Todos los tiempos se trabajan en UTC internamente
 * y se convierten al timezone del usuario solo para display.
 */
import { format, formatDistanceToNow, isPast, isFuture, addHours } from 'date-fns'
import { es } from 'date-fns/locale'

/** Formatea una fecha como "12 jun, 18:00" */
export function formatMatchDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return format(d, "d MMM, HH:mm", { locale: es })
}

/** Formatea una fecha como "12 de junio de 2026" */
export function formatFullDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return format(d, "d 'de' MMMM 'de' yyyy", { locale: es })
}

/** "hace 3 minutos", "en 2 horas", etc. */
export function formatRelative(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return formatDistanceToNow(d, { addSuffix: true, locale: es })
}

/** True si el partido ya empezó */
export function hasMatchStarted(scheduledAt: Date | string): boolean {
  const d = typeof scheduledAt === 'string' ? new Date(scheduledAt) : scheduledAt
  return isPast(d)
}

/** True si aún se pueden hacer predicciones (>1h antes del partido) */
export function isPredictionOpen(scheduledAt: Date | string): boolean {
  const d = typeof scheduledAt === 'string' ? new Date(scheduledAt) : scheduledAt
  const deadline = addHours(d, -1)
  return isFuture(deadline)
}

/** Tiempo restante hasta el cierre de predicciones */
export function timeUntilDeadline(scheduledAt: Date | string): string {
  const d = typeof scheduledAt === 'string' ? new Date(scheduledAt) : scheduledAt
  const deadline = addHours(d, -1)
  if (isPast(deadline)) return 'Cerradas'
  return formatDistanceToNow(deadline, { addSuffix: false, locale: es })
}
