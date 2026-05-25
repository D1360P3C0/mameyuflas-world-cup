-- ══════════════════════════════════════════════════════════════
-- 006_profile_surprise_team.sql
-- Añade campo "ojito_con" (equipo sorpresa) al perfil de usuario.
--
-- NOTA: surprise_team_id es TEXT (no UUID) porque teams.id
-- usa códigos FIFA de texto ('MAR', 'JPN', 'SEN'…), no UUIDs.
-- ══════════════════════════════════════════════════════════════

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS surprise_team_id TEXT
    REFERENCES public.teams(id) ON DELETE SET NULL;

COMMENT ON COLUMN public.profiles.surprise_team_id IS
  'Equipo que el usuario cree que dará la sorpresa ("Ojito con 🔥"). Se elige al registrarse. FK a teams.id (código FIFA, ej: "MAR", "JPN").';
