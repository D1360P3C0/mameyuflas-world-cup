/**
 * Endpoint para webhooks externos.
 * FASE 6: Implementar recepción de actualizaciones de partidos desde API-Football u otras APIs.
 *
 * TODO (FASE 6):
 *   - Verificar firma/secreto del webhook
 *   - Procesar actualización de marcador
 *   - Actualizar tabla `matches` en Supabase
 *   - Disparar notificaciones via Realtime
 */
import { NextResponse } from 'next/server'

export async function POST() {
  // Placeholder — implementar en FASE 6
  return NextResponse.json(
    { message: 'Webhook endpoint — disponible en FASE 6' },
    { status: 501 }
  )
}
