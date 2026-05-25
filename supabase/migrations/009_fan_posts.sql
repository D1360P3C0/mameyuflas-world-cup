-- ============================================================
-- 009_fan_posts.sql
-- Tablon persistente con posts, reacciones, comentarios
-- y bucket publico para imagenes del feed.
-- ============================================================

INSERT INTO storage.buckets (id, name, public)
SELECT 'fan-media', 'fan-media', true
WHERE NOT EXISTS (
  SELECT 1 FROM storage.buckets WHERE id = 'fan-media'
);

CREATE TABLE IF NOT EXISTS public.fan_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  body TEXT NOT NULL DEFAULT '',
  image_path TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.fan_post_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.fan_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reaction_type TEXT NOT NULL CHECK (reaction_type IN ('like', 'dislike')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (post_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.fan_post_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.fan_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS fan_posts_created_at_idx
  ON public.fan_posts (created_at DESC);

CREATE INDEX IF NOT EXISTS fan_post_reactions_post_id_idx
  ON public.fan_post_reactions (post_id);

CREATE INDEX IF NOT EXISTS fan_post_comments_post_id_idx
  ON public.fan_post_comments (post_id, created_at DESC);

ALTER TABLE public.fan_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fan_post_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fan_post_comments ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'fan_posts'
      AND policyname = 'fan_posts_select_public'
  ) THEN
    CREATE POLICY "fan_posts_select_public"
      ON public.fan_posts
      FOR SELECT
      USING (true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'fan_posts'
      AND policyname = 'fan_posts_insert_own'
  ) THEN
    CREATE POLICY "fan_posts_insert_own"
      ON public.fan_posts
      FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'fan_posts'
      AND policyname = 'fan_posts_update_own'
  ) THEN
    CREATE POLICY "fan_posts_update_own"
      ON public.fan_posts
      FOR UPDATE
      TO authenticated
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'fan_posts'
      AND policyname = 'fan_posts_delete_own'
  ) THEN
    CREATE POLICY "fan_posts_delete_own"
      ON public.fan_posts
      FOR DELETE
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'fan_post_reactions'
      AND policyname = 'fan_post_reactions_select_public'
  ) THEN
    CREATE POLICY "fan_post_reactions_select_public"
      ON public.fan_post_reactions
      FOR SELECT
      USING (true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'fan_post_reactions'
      AND policyname = 'fan_post_reactions_insert_own'
  ) THEN
    CREATE POLICY "fan_post_reactions_insert_own"
      ON public.fan_post_reactions
      FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'fan_post_reactions'
      AND policyname = 'fan_post_reactions_update_own'
  ) THEN
    CREATE POLICY "fan_post_reactions_update_own"
      ON public.fan_post_reactions
      FOR UPDATE
      TO authenticated
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'fan_post_reactions'
      AND policyname = 'fan_post_reactions_delete_own'
  ) THEN
    CREATE POLICY "fan_post_reactions_delete_own"
      ON public.fan_post_reactions
      FOR DELETE
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'fan_post_comments'
      AND policyname = 'fan_post_comments_select_public'
  ) THEN
    CREATE POLICY "fan_post_comments_select_public"
      ON public.fan_post_comments
      FOR SELECT
      USING (true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'fan_post_comments'
      AND policyname = 'fan_post_comments_insert_own'
  ) THEN
    CREATE POLICY "fan_post_comments_insert_own"
      ON public.fan_post_comments
      FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'fan_post_comments'
      AND policyname = 'fan_post_comments_update_own'
  ) THEN
    CREATE POLICY "fan_post_comments_update_own"
      ON public.fan_post_comments
      FOR UPDATE
      TO authenticated
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'fan_post_comments'
      AND policyname = 'fan_post_comments_delete_own'
  ) THEN
    CREATE POLICY "fan_post_comments_delete_own"
      ON public.fan_post_comments
      FOR DELETE
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'fan_posts_set_updated_at'
  ) THEN
    CREATE TRIGGER fan_posts_set_updated_at
      BEFORE UPDATE ON public.fan_posts
      FOR EACH ROW
      EXECUTE FUNCTION public.set_updated_at();
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'fan_post_comments_set_updated_at'
  ) THEN
    CREATE TRIGGER fan_post_comments_set_updated_at
      BEFORE UPDATE ON public.fan_post_comments
      FOR EACH ROW
      EXECUTE FUNCTION public.set_updated_at();
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'fan_media_select_public'
  ) THEN
    CREATE POLICY "fan_media_select_public"
      ON storage.objects
      FOR SELECT
      USING (bucket_id = 'fan-media');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'fan_media_insert_own'
  ) THEN
    CREATE POLICY "fan_media_insert_own"
      ON storage.objects
      FOR INSERT
      TO authenticated
      WITH CHECK (
        bucket_id = 'fan-media'
        AND auth.uid()::text = (storage.foldername(name))[1]
      );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'fan_media_update_own'
  ) THEN
    CREATE POLICY "fan_media_update_own"
      ON storage.objects
      FOR UPDATE
      TO authenticated
      USING (
        bucket_id = 'fan-media'
        AND auth.uid()::text = (storage.foldername(name))[1]
      )
      WITH CHECK (
        bucket_id = 'fan-media'
        AND auth.uid()::text = (storage.foldername(name))[1]
      );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'fan_media_delete_own'
  ) THEN
    CREATE POLICY "fan_media_delete_own"
      ON storage.objects
      FOR DELETE
      TO authenticated
      USING (
        bucket_id = 'fan-media'
        AND auth.uid()::text = (storage.foldername(name))[1]
      );
  END IF;
END $$;
