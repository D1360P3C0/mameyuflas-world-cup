-- ============================================================
-- MWC — Migración inicial
-- Tabla profiles + trigger auto-creación + RLS
-- ============================================================

-- ============================================================
-- Tabla: profiles
-- Vinculada a auth.users 1-to-1.
-- Se crea automáticamente via trigger al registrarse.
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username      TEXT NOT NULL UNIQUE,
  display_name  TEXT NOT NULL,
  avatar_url    TEXT,
  bio           TEXT,
  country_code  VARCHAR(2),
  favorite_team TEXT,
  is_admin      BOOLEAN NOT NULL DEFAULT false,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Constraint: username solo letras, números y guiones bajos (3-20 chars)
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_username_format
  CHECK (username ~ '^[a-zA-Z0-9_]{3,20}$');

-- ============================================================
-- RLS (Row Level Security)
-- ============================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Cualquiera puede leer perfiles públicos (necesario para leaderboard)
CREATE POLICY "profiles_select_public"
  ON public.profiles
  FOR SELECT
  USING (true);

-- Solo el propio usuario puede actualizar su perfil
CREATE POLICY "profiles_update_own"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- El trigger inserta con SECURITY DEFINER (service role), pero también
-- permitimos al usuario insertar su propio perfil por si acaso
CREATE POLICY "profiles_insert_own"
  ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ============================================================
-- Función: set_updated_at
-- Actualiza updated_at en cada UPDATE automáticamente
-- ============================================================
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER profiles_set_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- ============================================================
-- Función + Trigger: handle_new_user
-- Crea automáticamente un perfil cuando se registra un usuario
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _username      TEXT;
  _base_username TEXT;
  _display_name  TEXT;
  _counter       INT := 0;
BEGIN
  -- Nombre de display: full_name del provider OAuth, o parte local del email
  _display_name := COALESCE(
    NULLIF(TRIM(NEW.raw_user_meta_data->>'full_name'), ''),
    NULLIF(TRIM(NEW.raw_user_meta_data->>'name'), ''),
    split_part(NEW.email, '@', 1)
  );

  -- Username base: si viene en metadatos (registro manual), usarlo;
  -- si no (OAuth), generarlo desde el email
  _base_username := lower(regexp_replace(
    COALESCE(
      NULLIF(TRIM(NEW.raw_user_meta_data->>'username'), ''),
      split_part(NEW.email, '@', 1)
    ),
    '[^a-zA-Z0-9_]', '_', 'g'
  ));

  -- Asegurar mínimo 3 chars y máximo 15 (para dejar espacio al sufijo numérico)
  IF length(_base_username) < 3 THEN
    _base_username := _base_username || '_user';
  END IF;
  _base_username := substring(_base_username FROM 1 FOR 15);

  -- Resolver colisiones añadiendo sufijo numérico
  _username := _base_username;
  WHILE EXISTS (SELECT 1 FROM public.profiles WHERE username = _username) LOOP
    _counter := _counter + 1;
    _username := _base_username || _counter::TEXT;
  END LOOP;

  -- Insertar el perfil
  INSERT INTO public.profiles (id, username, display_name, avatar_url)
  VALUES (
    NEW.id,
    _username,
    _display_name,
    NULLIF(TRIM(COALESCE(NEW.raw_user_meta_data->>'avatar_url', '')), '')
  );

  RETURN NEW;
END;
$$;

-- Trigger en auth.users (corre después de cada INSERT)
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- Tabla: teams (stub para FK en matches)
-- Se rellenará con el seed de equipos del Mundial 2026
-- ============================================================
CREATE TABLE IF NOT EXISTS public.teams (
  id            TEXT PRIMARY KEY,
  name          TEXT NOT NULL,
  country_code  VARCHAR(2),
  group_letter  VARCHAR(1),
  flag_url      TEXT,
  confederation TEXT
);

ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "teams_select_public"
  ON public.teams FOR SELECT USING (true);

-- ============================================================
-- Tabla: matches (stub)
-- Se rellenará con el schedule del Mundial 2026
-- ============================================================
CREATE TABLE IF NOT EXISTS public.matches (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  home_team_id     TEXT REFERENCES public.teams(id),
  away_team_id     TEXT REFERENCES public.teams(id),
  stage            TEXT NOT NULL,
  group_letter     VARCHAR(1),
  match_number     INT NOT NULL,
  scheduled_at     TIMESTAMPTZ NOT NULL,
  venue            TEXT,
  city             TEXT,
  status           TEXT NOT NULL DEFAULT 'scheduled',
  home_score       INT,
  away_score       INT,
  home_score_et    INT,
  away_score_et    INT,
  home_score_pens  INT,
  away_score_pens  INT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "matches_select_public"
  ON public.matches FOR SELECT USING (true);

-- Solo admin puede modificar partidos
CREATE POLICY "matches_admin_all"
  ON public.matches
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

CREATE TRIGGER matches_set_updated_at
  BEFORE UPDATE ON public.matches
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();
