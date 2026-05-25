-- ============================================================
-- 008_tournament_stats_cache.sql
-- Soporte para sincronizacion externa del torneo y nuevas
-- predicciones especiales basadas en datos reales.
-- ============================================================

ALTER TABLE public.matches
  ADD COLUMN IF NOT EXISTS external_fixture_id BIGINT,
  ADD COLUMN IF NOT EXISTS halftime_checked_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS fulltime_checked_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS last_external_sync_at TIMESTAMPTZ;

CREATE TABLE IF NOT EXISTS public.tournament_stats_cache (
  key TEXT PRIMARY KEY,
  payload JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.tournament_stats_cache ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'tournament_stats_cache'
      AND policyname = 'tournament_stats_cache_select_public'
  ) THEN
    CREATE POLICY "tournament_stats_cache_select_public"
      ON public.tournament_stats_cache
      FOR SELECT
      USING (true);
  END IF;
END $$;

ALTER TABLE public.special_predictions
  ADD COLUMN IF NOT EXISTS top_assist_player TEXT;

COMMENT ON COLUMN public.matches.external_fixture_id IS
  'ID del fixture en el proveedor externo de resultados.';

COMMENT ON COLUMN public.matches.halftime_checked_at IS
  'Ultima comprobacion automatica del marcador al descanso.';

COMMENT ON COLUMN public.matches.fulltime_checked_at IS
  'Ultima comprobacion automatica del marcador al final del partido.';

COMMENT ON COLUMN public.matches.last_external_sync_at IS
  'Ultima sincronizacion general de este partido con la API externa.';

COMMENT ON TABLE public.tournament_stats_cache IS
  'Cache de standings y rankings globales sincronizados desde un proveedor externo.';

COMMENT ON COLUMN public.special_predictions.top_assist_player IS
  'Jugador que el usuario predice como maximo asistente del torneo.';
