/**
 * Schemas de validación Zod para ligas privadas.
 */
import { z } from 'zod'
import { DEFAULT_MAX_LEAGUE_MEMBERS, LEAGUE_INVITE_CODE_LENGTH } from '@/lib/constants/ui'

export const createLeagueSchema = z.object({
  name: z
    .string()
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(50, 'El nombre no puede superar 50 caracteres'),
  description: z
    .string()
    .max(200, 'La descripción no puede superar 200 caracteres')
    .optional(),
  maxMembers: z
    .number()
    .int()
    .min(2, 'Mínimo 2 miembros')
    .max(200, 'Máximo 200 miembros')
    .default(DEFAULT_MAX_LEAGUE_MEMBERS),
  isPublic: z.boolean().default(false),
})

export const joinLeagueSchema = z.object({
  inviteCode: z
    .string()
    .length(LEAGUE_INVITE_CODE_LENGTH, `El código debe tener ${LEAGUE_INVITE_CODE_LENGTH} caracteres`)
    .toUpperCase(),
})

export type CreateLeagueInput = z.infer<typeof createLeagueSchema>
export type JoinLeagueInput = z.infer<typeof joinLeagueSchema>
