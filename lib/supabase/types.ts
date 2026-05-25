/**
 * Re-export de los tipos generados por Supabase CLI.
 *
 * El archivo types/database.types.ts se genera con:
 *   npm run supabase:types
 *
 * Importar siempre desde aquí, nunca directamente desde types/database.types.ts,
 * para centralizar el punto de entrada.
 */
export type { Database, Tables, TablesInsert, TablesUpdate } from '@/types/database.types'
