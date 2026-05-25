-- ============================================================
-- MWC - FASE 2: Predicciones de eliminatorias
-- Seed de slots knockout + tabla knockout_predictions
-- ============================================================

-- ============================================================
-- Slots de eliminatorias (32 partidos)
-- Equipos inicialmente TBD; los picks del usuario rellenan el bracket.
-- Horarios aproximados en UTC y editables por admin.
-- ============================================================
INSERT INTO public.matches
  (home_team_id, away_team_id, stage, group_letter, match_number, scheduled_at, venue, city)
VALUES
  -- Ronda de 32 (16)
  (NULL, NULL, 'r32', NULL,  73, '2026-06-28 18:00:00+00', 'TBD', 'TBD'),
  (NULL, NULL, 'r32', NULL,  74, '2026-06-28 21:00:00+00', 'TBD', 'TBD'),
  (NULL, NULL, 'r32', NULL,  75, '2026-06-29 18:00:00+00', 'TBD', 'TBD'),
  (NULL, NULL, 'r32', NULL,  76, '2026-06-29 21:00:00+00', 'TBD', 'TBD'),
  (NULL, NULL, 'r32', NULL,  77, '2026-06-30 18:00:00+00', 'TBD', 'TBD'),
  (NULL, NULL, 'r32', NULL,  78, '2026-06-30 21:00:00+00', 'TBD', 'TBD'),
  (NULL, NULL, 'r32', NULL,  79, '2026-07-01 18:00:00+00', 'TBD', 'TBD'),
  (NULL, NULL, 'r32', NULL,  80, '2026-07-01 21:00:00+00', 'TBD', 'TBD'),
  (NULL, NULL, 'r32', NULL,  81, '2026-07-02 18:00:00+00', 'TBD', 'TBD'),
  (NULL, NULL, 'r32', NULL,  82, '2026-07-02 21:00:00+00', 'TBD', 'TBD'),
  (NULL, NULL, 'r32', NULL,  83, '2026-07-03 18:00:00+00', 'TBD', 'TBD'),
  (NULL, NULL, 'r32', NULL,  84, '2026-07-03 21:00:00+00', 'TBD', 'TBD'),
  (NULL, NULL, 'r32', NULL,  85, '2026-07-04 18:00:00+00', 'TBD', 'TBD'),
  (NULL, NULL, 'r32', NULL,  86, '2026-07-04 21:00:00+00', 'TBD', 'TBD'),
  (NULL, NULL, 'r32', NULL,  87, '2026-07-05 18:00:00+00', 'TBD', 'TBD'),
  (NULL, NULL, 'r32', NULL,  88, '2026-07-05 21:00:00+00', 'TBD', 'TBD'),

  -- Octavos (8)
  (NULL, NULL, 'r16', NULL,  89, '2026-07-07 18:00:00+00', 'TBD', 'TBD'),
  (NULL, NULL, 'r16', NULL,  90, '2026-07-07 21:00:00+00', 'TBD', 'TBD'),
  (NULL, NULL, 'r16', NULL,  91, '2026-07-08 18:00:00+00', 'TBD', 'TBD'),
  (NULL, NULL, 'r16', NULL,  92, '2026-07-08 21:00:00+00', 'TBD', 'TBD'),
  (NULL, NULL, 'r16', NULL,  93, '2026-07-09 18:00:00+00', 'TBD', 'TBD'),
  (NULL, NULL, 'r16', NULL,  94, '2026-07-09 21:00:00+00', 'TBD', 'TBD'),
  (NULL, NULL, 'r16', NULL,  95, '2026-07-10 18:00:00+00', 'TBD', 'TBD'),
  (NULL, NULL, 'r16', NULL,  96, '2026-07-10 21:00:00+00', 'TBD', 'TBD'),

  -- Cuartos (4)
  (NULL, NULL, 'qf',  NULL,  97, '2026-07-12 18:00:00+00', 'TBD', 'TBD'),
  (NULL, NULL, 'qf',  NULL,  98, '2026-07-12 21:00:00+00', 'TBD', 'TBD'),
  (NULL, NULL, 'qf',  NULL,  99, '2026-07-13 18:00:00+00', 'TBD', 'TBD'),
  (NULL, NULL, 'qf',  NULL, 100, '2026-07-13 21:00:00+00', 'TBD', 'TBD'),

  -- Semifinales (2)
  (NULL, NULL, 'sf',  NULL, 101, '2026-07-15 19:00:00+00', 'TBD', 'TBD'),
  (NULL, NULL, 'sf',  NULL, 102, '2026-07-16 19:00:00+00', 'TBD', 'TBD'),

  -- Tercer puesto y final
  (NULL, NULL, '3rd', NULL, 103, '2026-07-18 18:00:00+00', 'TBD', 'TBD'),
  (NULL, NULL, 'final', NULL, 104, '2026-07-19 19:00:00+00', 'TBD', 'TBD')
ON CONFLICT DO NOTHING;

-- ============================================================
-- Tabla: knockout_predictions
-- Un pick de ganador por usuario y por slot de eliminatoria.
-- ============================================================
CREATE TABLE IF NOT EXISTS public.knockout_predictions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  match_id        UUID NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
  winner_team_id  TEXT NOT NULL REFERENCES public.teams(id),
  points_earned   SMALLINT DEFAULT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, match_id)
);

ALTER TABLE public.knockout_predictions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "knockout_predictions_select_own"
  ON public.knockout_predictions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "knockout_predictions_insert_own"
  ON public.knockout_predictions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "knockout_predictions_update_own"
  ON public.knockout_predictions
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "knockout_predictions_delete_own"
  ON public.knockout_predictions
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE TRIGGER knockout_predictions_set_updated_at
  BEFORE UPDATE ON public.knockout_predictions
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();
