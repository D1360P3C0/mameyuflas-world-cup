-- ============================================================
-- 013_classic_prediction_expansion.sql
-- Amplia el esquema de predicciones para cubrir todas las
-- piezas del modo clasico de puntuacion.
-- ============================================================

-- ============================================================
-- Predicciones de clasificacion final por grupo
-- Una fila por usuario y grupo con el 1. al 4. puesto.
-- ============================================================
CREATE TABLE IF NOT EXISTS public.group_standing_predictions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  group_letter    CHAR(1) NOT NULL CHECK (group_letter BETWEEN 'A' AND 'L'),
  first_team_id   TEXT NOT NULL REFERENCES public.teams(id),
  second_team_id  TEXT NOT NULL REFERENCES public.teams(id),
  third_team_id   TEXT NOT NULL REFERENCES public.teams(id),
  fourth_team_id  TEXT NOT NULL REFERENCES public.teams(id),
  points_earned   SMALLINT DEFAULT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, group_letter),
  CONSTRAINT group_standing_predictions_distinct_teams_chk CHECK (
    first_team_id <> second_team_id AND
    first_team_id <> third_team_id AND
    first_team_id <> fourth_team_id AND
    second_team_id <> third_team_id AND
    second_team_id <> fourth_team_id AND
    third_team_id <> fourth_team_id
  )
);

ALTER TABLE public.group_standing_predictions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "group_standing_predictions_select_authenticated"
  ON public.group_standing_predictions
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "group_standing_predictions_insert_own"
  ON public.group_standing_predictions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "group_standing_predictions_update_own"
  ON public.group_standing_predictions
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "group_standing_predictions_delete_own"
  ON public.group_standing_predictions
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE TRIGGER group_standing_predictions_set_updated_at
  BEFORE UPDATE ON public.group_standing_predictions
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

COMMENT ON TABLE public.group_standing_predictions IS
  'Prediccion del orden final 1-4 de cada grupo en el modo clasico.';

-- ============================================================
-- Ranking de mejores terceras
-- Una fila por posicion del 1 al 8.
-- ============================================================
CREATE TABLE IF NOT EXISTS public.best_third_predictions (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ranking_position  SMALLINT NOT NULL CHECK (ranking_position BETWEEN 1 AND 8),
  team_id           TEXT NOT NULL REFERENCES public.teams(id),
  points_earned     SMALLINT DEFAULT NULL,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, ranking_position),
  UNIQUE (user_id, team_id)
);

ALTER TABLE public.best_third_predictions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "best_third_predictions_select_authenticated"
  ON public.best_third_predictions
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "best_third_predictions_insert_own"
  ON public.best_third_predictions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "best_third_predictions_update_own"
  ON public.best_third_predictions
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "best_third_predictions_delete_own"
  ON public.best_third_predictions
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE TRIGGER best_third_predictions_set_updated_at
  BEFORE UPDATE ON public.best_third_predictions
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

COMMENT ON TABLE public.best_third_predictions IS
  'Ranking pronosticado de las 8 mejores terceras del torneo.';

-- ============================================================
-- Extras del torneo que faltaban en special_predictions
-- ============================================================
ALTER TABLE public.special_predictions
  ADD COLUMN IF NOT EXISTS revelation_team_id TEXT REFERENCES public.teams(id),
  ADD COLUMN IF NOT EXISTS most_goals_in_groups_team_id TEXT REFERENCES public.teams(id),
  ADD COLUMN IF NOT EXISTS fewest_goals_against_in_groups_team_id TEXT REFERENCES public.teams(id);

COMMENT ON COLUMN public.special_predictions.revelation_team_id IS
  'Seleccion revelacion pronosticada por el usuario.';

COMMENT ON COLUMN public.special_predictions.most_goals_in_groups_team_id IS
  'Seleccion pronosticada como mas goleadora en fase de grupos.';

COMMENT ON COLUMN public.special_predictions.fewest_goals_against_in_groups_team_id IS
  'Seleccion pronosticada como menos goleada en fase de grupos.';

-- ============================================================
-- Marcador del cruce tras 120 minutos para puntuar los brackets
-- ============================================================
ALTER TABLE public.knockout_predictions
  ADD COLUMN IF NOT EXISTS home_score_after_120 SMALLINT CHECK (home_score_after_120 >= 0),
  ADD COLUMN IF NOT EXISTS away_score_after_120 SMALLINT CHECK (away_score_after_120 >= 0);

COMMENT ON COLUMN public.knockout_predictions.home_score_after_120 IS
  'Marcador pronosticado del local tras 120 minutos, antes de penaltis.';

COMMENT ON COLUMN public.knockout_predictions.away_score_after_120 IS
  'Marcador pronosticado del visitante tras 120 minutos, antes de penaltis.';
