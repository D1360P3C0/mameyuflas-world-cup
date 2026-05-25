-- ============================================================
-- 010_admin_profile_fields.sql
-- Campos de gestión admin en profiles:
--   bonus_points     — puntos manuales (+ o -)
--   is_banned_fanzone — vetado del tablón
--   pays_entry       — participa con dinero
-- + política RLS para que admin pueda actualizar cualquier perfil
-- ============================================================

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS bonus_points     INT     NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS is_banned_fanzone BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS pays_entry       BOOLEAN NOT NULL DEFAULT false;

-- Admin puede poner bonus_points en negativo si quiere penalizar
-- (no ponemos CHECK >= 0 aquí — el server action controla el límite mínimo)

-- ============================================================
-- RLS: admin puede actualizar cualquier perfil
-- (la política existente "profiles_update_own" solo permite
--  que el usuario actualice su propio perfil)
-- ============================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename  = 'profiles'
      AND policyname = 'profiles_update_admin'
  ) THEN
    CREATE POLICY "profiles_update_admin"
      ON public.profiles
      FOR UPDATE
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM public.profiles p
          WHERE p.id = auth.uid() AND p.is_admin = true
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM public.profiles p
          WHERE p.id = auth.uid() AND p.is_admin = true
        )
      );
  END IF;
END $$;
