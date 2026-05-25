-- ══════════════════════════════════════════════════════════════
-- 005_spain_squad.sql
-- Convocatoria OFICIAL de España para el Mundial 2026.
-- Tabla spain_squad + políticas RLS + seed con lista oficial.
-- ══════════════════════════════════════════════════════════════

-- ── Tabla ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.spain_squad (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  dorsal      INT         NOT NULL UNIQUE,
  name        TEXT        NOT NULL,        -- nombre completo
  short_name  TEXT        NOT NULL,        -- nombre corto para UI (ej. "Yamal")
  position    TEXT        NOT NULL         -- 'GK' | 'DEF' | 'MID' | 'FWD'
                          CHECK (position IN ('GK', 'DEF', 'MID', 'FWD')),
  club        TEXT        NOT NULL,
  age         INT,
  caps        INT         DEFAULT 0,
  is_active   BOOLEAN     DEFAULT true,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- Índices
CREATE INDEX IF NOT EXISTS spain_squad_position_idx ON public.spain_squad (position);

-- RLS
ALTER TABLE public.spain_squad ENABLE ROW LEVEL SECURITY;

-- Todos los usuarios autenticados pueden leer
CREATE POLICY "Spain squad readable by all"
  ON public.spain_squad FOR SELECT
  TO authenticated
  USING (true);

-- Solo admins pueden modificar
CREATE POLICY "Spain squad editable by admins"
  ON public.spain_squad FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.is_admin = true
    )
  );

-- ── Tabla de alineaciones de España guardadas por usuario ────
CREATE TABLE IF NOT EXISTS public.spain_lineups (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  match_id    UUID        REFERENCES public.matches(id) ON DELETE SET NULL,
  formation   TEXT        NOT NULL DEFAULT '4-3-3',
  -- Slots: posición de la formación → player_id
  -- Guardamos como JSONB: { "GK": uuid, "DEF_1": uuid, ... }
  slots       JSONB       NOT NULL DEFAULT '{}'::jsonb,
  note        TEXT,       -- texto opcional del usuario al publicar
  is_published BOOLEAN    DEFAULT false,
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, match_id)
);

ALTER TABLE public.spain_lineups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read published lineups"
  ON public.spain_lineups FOR SELECT
  TO authenticated
  USING (is_published = true OR user_id = auth.uid());

CREATE POLICY "Users manage their own lineups"
  ON public.spain_lineups FOR ALL
  TO authenticated
  USING  (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Trigger updated_at
CREATE OR REPLACE FUNCTION public.update_spain_lineups_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

CREATE TRIGGER spain_lineups_updated_at
  BEFORE UPDATE ON public.spain_lineups
  FOR EACH ROW EXECUTE FUNCTION public.update_spain_lineups_updated_at();

-- ══════════════════════════════════════════════════════════════
-- SEED — Convocatoria OFICIAL España Mundial 2026
-- Lista confirmada por la RFEF
-- ══════════════════════════════════════════════════════════════

-- Limpiar datos previos si se re-ejecuta
TRUNCATE public.spain_squad RESTART IDENTITY CASCADE;

INSERT INTO public.spain_squad
  (dorsal, name, short_name, position, club, age, caps)
VALUES

  -- ── PORTEROS ─────────────────────────────────────────────
  (1,  'Unai Simón',          'U. Simón',   'GK',  'Athletic Club',        28, 45),
  (13, 'David Raya',          'D. Raya',    'GK',  'Arsenal FC',           30, 16),
  (25, 'Joan García',         'J. García',  'GK',  'FC Barcelona',         24,  2),

  -- ── DEFENSAS ─────────────────────────────────────────────
  (2,  'Pedro Porro',         'Porro',      'DEF', 'Tottenham Hotspur',    25, 22),
  (3,  'Alejandro Grimaldo',  'Grimaldo',   'DEF', 'Bayer Leverkusen',     30, 13),
  (4,  'Aymeric Laporte',     'Laporte',    'DEF', 'Athletic Club',        31, 36),
  (5,  'Eric García',         'E. García',  'DEF', 'FC Barcelona',         24, 32),
  (12, 'Marc Cucurella',      'Cucurella',  'DEF', 'Chelsea FC',           27, 29),
  (18, 'Marcos Llorente',     'Llorente',   'DEF', 'Atlético de Madrid',   30, 31),
  (20, 'Pau Cubarsí',         'Cubarsí',    'DEF', 'FC Barcelona',         18, 11),
  (24, 'Marc Pubill',         'Pubill',     'DEF', 'Atlético de Madrid',   23,  6),

  -- ── MEDIOCAMPISTAS ───────────────────────────────────────
  (6,  'Mikel Merino',        'M. Merino',  'MID', 'Arsenal FC',           29, 41),
  (7,  'Gavi',                'Gavi',       'MID', 'FC Barcelona',         21, 46),
  (8,  'Fabián Ruiz',         'Fabián',     'MID', 'Paris Saint-Germain',  29, 41),
  (9,  'Martín Zubimendi',    'Zubimendi',  'MID', 'Arsenal FC',           26, 21),
  (14, 'Rodrigo Hernández',   'Rodri',      'MID', 'Manchester City',      29, 62),
  (16, 'Pedri',               'Pedri',      'MID', 'FC Barcelona',         23, 41),
  (22, 'Álex Baena',          'A. Baena',   'MID', 'Atlético de Madrid',   24, 11),

  -- ── DELANTEROS ───────────────────────────────────────────
  (10, 'Lamine Yamal',        'Yamal',      'FWD', 'FC Barcelona',         18, 19),
  (11, 'Nico Williams',       'N. Williams','FWD', 'Athletic Club',        23, 21),
  (15, 'Dani Olmo',           'D. Olmo',    'FWD', 'FC Barcelona',         27, 36),
  (17, 'Yeremy Pino',         'Y. Pino',    'FWD', 'Crystal Palace',       23, 31),
  (19, 'Ferran Torres',       'F. Torres',  'FWD', 'FC Barcelona',         25, 51),
  (21, 'Mikel Oyarzabal',     'Oyarzabal',  'FWD', 'Real Sociedad',        28, 41),
  (23, 'Borja Iglesias',      'Borja',      'FWD', 'RC Celta de Vigo',     33, 26),
  (26, 'Víctor Muñoz',        'V. Muñoz',   'FWD', 'CA Osasuna',           24,  5);

-- Comentarios
COMMENT ON TABLE public.spain_squad IS
  'Convocatoria OFICIAL de España para el Mundial 2026 (lista RFEF).';
COMMENT ON TABLE public.spain_lineups IS
  'Alineaciones de España creadas por usuarios. is_published = true aparece en el Feed.';
