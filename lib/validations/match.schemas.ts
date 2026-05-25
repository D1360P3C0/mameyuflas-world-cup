/**
 * Schemas de validación Zod para comentarios y reacciones de partidos.
 */
import { z } from 'zod'
import { MAX_COMMENT_LENGTH, MATCH_REACTIONS } from '@/lib/constants/ui'

export const matchCommentSchema = z.object({
  matchId: z.string().uuid('ID de partido inválido'),
  content: z
    .string()
    .min(1, 'El comentario no puede estar vacío')
    .max(MAX_COMMENT_LENGTH, `Máximo ${MAX_COMMENT_LENGTH} caracteres`),
  parentId: z.string().uuid().optional(),
})

export const matchReactionSchema = z.object({
  matchId: z.string().uuid('ID de partido inválido'),
  reaction: z.enum([...MATCH_REACTIONS] as [string, ...string[]]),
})

export type MatchCommentInput = z.infer<typeof matchCommentSchema>
export type MatchReactionInput = z.infer<typeof matchReactionSchema>
