-- ============================================================
-- 007_handle_new_user_surprise_team.sql
-- Guarda surprise_team_id desde auth metadata al crear profiles.
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _username         TEXT;
  _base_username    TEXT;
  _display_name     TEXT;
  _surprise_team_id TEXT;
  _counter          INT := 0;
BEGIN
  _display_name := COALESCE(
    NULLIF(TRIM(NEW.raw_user_meta_data->>'full_name'), ''),
    NULLIF(TRIM(NEW.raw_user_meta_data->>'name'), ''),
    split_part(NEW.email, '@', 1)
  );

  _base_username := lower(regexp_replace(
    COALESCE(
      NULLIF(TRIM(NEW.raw_user_meta_data->>'username'), ''),
      split_part(NEW.email, '@', 1)
    ),
    '[^a-zA-Z0-9_]', '_', 'g'
  ));

  IF length(_base_username) < 3 THEN
    _base_username := _base_username || '_user';
  END IF;
  _base_username := substring(_base_username FROM 1 FOR 15);

  _username := _base_username;
  WHILE EXISTS (SELECT 1 FROM public.profiles WHERE username = _username) LOOP
    _counter := _counter + 1;
    _username := _base_username || _counter::TEXT;
  END LOOP;

  _surprise_team_id := NULLIF(TRIM(COALESCE(NEW.raw_user_meta_data->>'surprise_team_id', '')), '');

  IF _surprise_team_id IS NOT NULL
     AND NOT EXISTS (SELECT 1 FROM public.teams WHERE id = _surprise_team_id) THEN
    _surprise_team_id := NULL;
  END IF;

  INSERT INTO public.profiles (
    id,
    username,
    display_name,
    avatar_url,
    surprise_team_id
  )
  VALUES (
    NEW.id,
    _username,
    _display_name,
    NULLIF(TRIM(COALESCE(NEW.raw_user_meta_data->>'avatar_url', '')), ''),
    _surprise_team_id
  );

  RETURN NEW;
END;
$$;
