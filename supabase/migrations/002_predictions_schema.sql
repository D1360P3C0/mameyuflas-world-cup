-- ============================================================
-- MWC — FASE 2: Esquema de Predicciones
-- Tablas: predictions + special_predictions
-- ============================================================

-- ============================================================
-- Tabla: predictions
-- Una predicción de marcador por usuario por partido.
-- El bloqueo (1h antes del partido) se gestiona en la app (Server Actions).
-- ============================================================
CREATE TABLE IF NOT EXISTS public.predictions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  match_id      UUID NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
  home_score    SMALLINT NOT NULL CHECK (home_score >= 0),
  away_score    SMALLINT NOT NULL CHECK (away_score >= 0),
  points_earned SMALLINT DEFAULT NULL, -- NULL = partido aún no jugado
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, match_id)           -- una predicción por usuario por partido
);

ALTER TABLE public.predictions ENABLE ROW LEVEL SECURITY;

-- Cualquier usuario autenticado puede leer todas las predicciones
-- (necesario para el leaderboard en FASE 4)
CREATE POLICY "predictions_select_authenticated"
  ON public.predictions
  FOR SELECT
  TO authenticated
  USING (true);

-- Solo el propio usuario puede crear su predicción
CREATE POLICY "predictions_insert_own"
  ON public.predictions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Solo el propio usuario puede actualizar su predicción
CREATE POLICY "predictions_update_own"
  ON public.predictions
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Solo el propio usuario puede borrar su predicción
CREATE POLICY "predictions_delete_own"
  ON public.predictions
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE TRIGGER predictions_set_updated_at
  BEFORE UPDATE ON public.predictions
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- ============================================================
-- Tabla: special_predictions
-- Predicciones de torneo: campeón, subcampeón, goleador, MVP, etc.
-- Una fila por usuario. Se bloquean al inicio del torneo (11 Jun 2026).
-- Jugadores como texto libre en FASE 2 — se migrará a FK en FASE futura.
-- ============================================================
CREATE TABLE IF NOT EXISTS public.special_predictions (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  champion_team_id    TEXT REFERENCES public.teams(id),
  runner_up_team_id   TEXT REFERENCES public.teams(id),
  top_scorer          TEXT,          -- nombre libre en FASE 2
  mvp                 TEXT,
  best_goalkeeper     TEXT,
  best_young_player   TEXT,
  points_earned       SMALLINT DEFAULT NULL,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.special_predictions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "special_predictions_select_authenticated"
  ON public.special_predictions
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "special_predictions_insert_own"
  ON public.special_predictions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "special_predictions_update_own"
  ON public.special_predictions
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "special_predictions_delete_own"
  ON public.special_predictions
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE TRIGGER special_predictions_set_updated_at
  BEFORE UPDATE ON public.special_predictions
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();
