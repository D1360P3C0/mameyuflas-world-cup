/**
 * Tipos de respuestas de API y Server Actions.
 */

/** Respuesta estándar de un Server Action */
export type ActionResult<T = void> =
  | { success: true; data: T; error?: never }
  | { success: false; error: string; data?: never }

/** Respuesta paginada */
export type PaginatedResult<T> = {
  data: T[]
  count: number
  page: number
  pageSize: number
  hasMore: boolean
}
