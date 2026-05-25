/**
 * Helper para combinar clases de Tailwind sin conflictos.
 *
 * Combina clsx (merge condicional) + tailwind-merge (resuelve conflictos Tailwind).
 *
 * Uso:
 *   cn('px-4 py-2', isActive && 'bg-mwc-gold-500', className)
 */
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
