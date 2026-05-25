# Plan de Base de Datos — Mameyuflas World Cup

## Principios

- RLS habilitado en **TODAS** las tablas
- UUIDs como primary keys (`gen_random_uuid()`)
- `created_at` y `updated_at` en todas las tablas
- `updated_at` gestionado por trigger SQL automático
- Soft deletes donde aplique (`deleted_at` nullable)
- Índices en todas las foreign keys y columnas de búsqueda frecuente

---

## Tablas Principales

### `profiles` — Extiende auth.users

```sql
id                uuid        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE
username          text        UNIQUE NOT NULL
display_name      text        NOT NULL
avatar_url        text
bio               text
country_code      char(2)     -- código ISO del país del usuario
favorite_team     text        -- código FIFA del equipo favorito
surprise_team_id  text        REFERENCES teams(id) ON DELETE SET NULL
                              -- "Ojito con 🔥": equipo que el usuario cree que dará la sorpresa
                              -- Se elige en el paso 2 del registro
is_admin          boolean     DEFAULT false
created_at        timestamptz DEFAULT now()
updated_at        timestamptz DEFAULT now()
```

⚠️ `surprise_team_id` es **TEXT** (no UUID) porque `teams.id` usa códigos FIFA de texto ('MAR', 'JPN'…).

**RLS:**
- `SELECT`: todos los usuarios autenticados pueden ver perfiles
- `UPDATE`: solo `auth.uid() = id`

**Trigger**: se crea automáticamente cuando un usuario se registra en `auth.users`.

---

### `teams` — Datos del Mundial (seed)

```sql
id              text        PRIMARY KEY  -- código FIFA: 'ESP', 'ARG', 'FRA'...
name            text        NOT NULL
country_code    char(2)
group_letter    char(1)     -- 'A' a 'L' (Mundial 2026 tiene 12 grupos, 48 equipos)
flag_url        text        -- URL de imagen libre de derechos
confederation   text        -- 'UEFA', 'CONMEBOL', 'CONCACAF', 'CAF', 'AFC', 'OFC'
```

**RLS:** SELECT público sin autenticación. Sin write desde cliente.

---

### `matches` — Calendario de partidos

```sql
id              uuid        PRIMARY KEY DEFAULT gen_random_uuid()
home_team_id    text        REFERENCES teams(id)
away_team_id    text        REFERENCES teams(id)
stage           text        NOT NULL  -- 'group', 'r32', 'r16', 'qf', 'sf', '3rd', 'final'
group_letter    char(1)               -- solo para stage='group'
match_number    int         NOT NULL  -- número oficial del partido (1-104)
scheduled_at    timestamptz NOT NULL
venue           text
city            text
status          text        DEFAULT 'scheduled'
                            -- 'scheduled' | 'live' | 'finished' | 'postponed'
home_score      int
away_score      int
home_score_et   int                   -- extra time
away_score_et   int
home_score_pens int                   -- penalties
away_score_pens int
created_at      timestamptz DEFAULT now()
updated_at      timestamptz DEFAULT now()
```

**RLS:** SELECT público. INSERT/UPDATE solo admin (`is_admin = true`).

---

### `match_events` — Eventos de un partido

```sql
id              uuid        PRIMARY KEY DEFAULT gen_random_uuid()
match_id        uuid        NOT NULL REFERENCES matches(id)
minute          int         NOT NULL
added_time      int         DEFAULT 0
event_type      text        NOT NULL
                            -- 'goal' | 'own_goal' | 'yellow' | 'red'
                            -- 'yellow_red' | 'substitution' | 'var' | 'penalty_miss'
team_id         text        REFERENCES teams(id)
player_name     text
assist_player   text                   -- solo para goles
substituted_in  text                   -- solo para sustituciones
substituted_out text                   -- solo para sustituciones
notes           text
created_at      timestamptz DEFAULT now()
```

**RLS:** SELECT público. INSERT/UPDATE solo admin.

---

### `predictions` — Predicciones de usuarios

```sql
id              uuid        PRIMARY KEY DEFAULT gen_random_uuid()
user_id         uuid        NOT NULL REFERENCES profiles(id)
match_id        uuid        REFERENCES matches(id)  -- NULL para predicciones globales
prediction_type text        NOT NULL
-- Tipos posibles:
-- 'match_result'    → home_goals + away_goals
-- 'champion'        → value = team_id
-- 'runner_up'       → value = team_id
-- 'top_scorer'      → value = player_name
-- 'best_player'     → value = player_name (MVP)
-- 'best_keeper'     → value = player_name
-- 'best_young'      → value = player_name
-- 'group_position'  → value = team_id, group_letter, position (1|2)
-- 'semifinalist'    → value = team_id

home_goals      int                    -- solo para match_result
away_goals      int                    -- solo para match_result
value           text                   -- para predicciones de valor único
group_letter    char(1)                -- para predicciones de grupo
position        int                    -- 1 o 2, para group_position
points_earned   int         DEFAULT 0  -- calculado cuando se cierra el partido
scored_at       timestamptz            -- cuándo se otorgaron los puntos
created_at      timestamptz DEFAULT now()
updated_at      timestamptz DEFAULT now()

UNIQUE (user_id, match_id, prediction_type, group_letter, position)
```

**RLS:**
- `SELECT`: propias (`auth.uid() = user_id`) O si el partido ya empezó (ajenas visibles)
- `INSERT`: `auth.uid() = user_id` + partido no empezado (verificar con función)
- `UPDATE`: `auth.uid() = user_id` + partido no empezado

---

### `leagues` — Ligas Privadas

```sql
id              uuid        PRIMARY KEY DEFAULT gen_random_uuid()
name            text        NOT NULL
description     text
invite_code     text        UNIQUE NOT NULL  -- 6 caracteres alfanuméricos uppercase
creator_id      uuid        NOT NULL REFERENCES profiles(id)
max_members     int         DEFAULT 50
is_public       boolean     DEFAULT false
avatar_url      text
created_at      timestamptz DEFAULT now()
updated_at      timestamptz DEFAULT now()
deleted_at      timestamptz                  -- soft delete
```

**RLS:**
- `SELECT`: miembros de la liga o ligas públicas
- `INSERT`: usuarios autenticados (con límite de ligas por usuario)
- `UPDATE`: solo creador

---

### `league_members` — Miembros de Ligas

```sql
id              uuid        PRIMARY KEY DEFAULT gen_random_uuid()
league_id       uuid        NOT NULL REFERENCES leagues(id)
user_id         uuid        NOT NULL REFERENCES profiles(id)
role            text        DEFAULT 'member'  -- 'owner' | 'admin' | 'member'
joined_at       timestamptz DEFAULT now()
left_at         timestamptz                  -- NULL = miembro activo

UNIQUE (league_id, user_id)
```

**RLS:**
- `SELECT`: miembros de la liga
- `INSERT`: usuario autenticado con código de invitación válido

---

### `leaderboard_cache` — Cache de Rankings

```sql
user_id         uuid        PRIMARY KEY REFERENCES profiles(id)
total_points    int         DEFAULT 0
exact_results   int         DEFAULT 0    -- predicciones de marcador exacto
correct_results int         DEFAULT 0    -- predicciones de resultado correcto
rank_global     int
updated_at      timestamptz DEFAULT now()
```

Se actualiza por trigger cuando se calculan puntos de predicciones.

---

### `match_comments` — Comentarios por partido

```sql
id              uuid        PRIMARY KEY DEFAULT gen_random_uuid()
match_id        uuid        NOT NULL REFERENCES matches(id)
user_id         uuid        NOT NULL REFERENCES profiles(id)
content         text        NOT NULL CHECK (length(content) <= 500)
parent_id       uuid        REFERENCES match_comments(id)  -- para replies
is_deleted      boolean     DEFAULT false
created_at      timestamptz DEFAULT now()
```

**RLS:**
- `SELECT`: todos los usuarios autenticados
- `INSERT`: `auth.uid() = user_id`
- `UPDATE`: soft delete, solo propio usuario o admin

---

### `match_reactions` — Reacciones por partido

```sql
id              uuid        PRIMARY KEY DEFAULT gen_random_uuid()
match_id        uuid        NOT NULL REFERENCES matches(id)
user_id         uuid        NOT NULL REFERENCES profiles(id)
reaction        text        NOT NULL  -- '⚽' | '🔥' | '😱' | '🎉' | '😤' | '👏'
created_at      timestamptz DEFAULT now()

UNIQUE (match_id, user_id, reaction)
```

---

### `activity_feed` — Feed Social

```sql
id              uuid        PRIMARY KEY DEFAULT gen_random_uuid()
actor_id        uuid        NOT NULL REFERENCES profiles(id)
activity_type   text        NOT NULL
-- 'prediction_exact' | 'prediction_correct' | 'rank_up'
-- 'league_joined' | 'achievement_earned'
target_user_id  uuid        REFERENCES profiles(id)   -- nullable
match_id        uuid        REFERENCES matches(id)    -- nullable
league_id       uuid        REFERENCES leagues(id)    -- nullable
metadata        jsonb       DEFAULT '{}'
created_at      timestamptz DEFAULT now()
```

---

### `achievements` — Catálogo de Logros

```sql
id              uuid        PRIMARY KEY DEFAULT gen_random_uuid()
code            text        UNIQUE NOT NULL
-- Ejemplos: 'first_exact_result', 'champion_picker', 'perfect_group', 'top_scorer_picker'
name            text        NOT NULL
description     text
icon_url        text
points          int         DEFAULT 0
```

### `user_achievements` — Logros de Usuarios

```sql
id              uuid        PRIMARY KEY DEFAULT gen_random_uuid()
user_id         uuid        NOT NULL REFERENCES profiles(id)
achievement_id  uuid        NOT NULL REFERENCES achievements(id)
earned_at       timestamptz DEFAULT now()

UNIQUE (user_id, achievement_id)
```

---

### `news_articles` — Noticias (Fase 6)

```sql
id              uuid        PRIMARY KEY DEFAULT gen_random_uuid()
external_id     text        UNIQUE NOT NULL  -- ID o URL del artículo externo
title           text        NOT NULL
summary         text
url             text        NOT NULL
image_url       text
source          text                         -- nombre de la fuente RSS/API
published_at    timestamptz
fetched_at      timestamptz DEFAULT now()
tags            text[]                       -- equipos, fases mencionadas
```

---

## Funciones y Triggers Clave

### Trigger `updated_at` (aplicar a todas las tablas)

```sql
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

### Función `handle_new_user` — Auto-crear profile al registrarse

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, display_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### Función `score_match_predictions` — Calcular puntos

Se ejecuta (manual por admin o via webhook) cuando un partido termina.
Calcula puntos para todas las predicciones y actualiza `leaderboard_cache`.
Implementar en FASE 4.

---

## Índices Recomendados

```sql
CREATE INDEX idx_predictions_user_id   ON predictions(user_id);
CREATE INDEX idx_predictions_match_id  ON predictions(match_id);
CREATE INDEX idx_matches_status        ON matches(status);
CREATE INDEX idx_matches_scheduled_at  ON matches(scheduled_at);
CREATE INDEX idx_comments_match_id     ON match_comments(match_id);
CREATE INDEX idx_activity_actor_id     ON activity_feed(actor_id);
CREATE INDEX idx_leaderboard_points    ON leaderboard_cache(total_points DESC);
CREATE INDEX idx_league_members_user   ON league_members(user_id);
```

---

### `spain_squad` — Convocatoria oficial de España

```sql
id          uuid        PRIMARY KEY DEFAULT gen_random_uuid()
dorsal      int         NOT NULL UNIQUE
name        text        NOT NULL        -- nombre completo
short_name  text        NOT NULL        -- nombre corto para UI (ej. "Yamal")
position    text        NOT NULL CHECK (position IN ('GK', 'DEF', 'MID', 'FWD'))
club        text        NOT NULL
age         int
caps        int         DEFAULT 0
is_active   boolean     DEFAULT true
created_at  timestamptz DEFAULT now()
```

**RLS:** SELECT para todos los autenticados. Write solo admins.
**Seed:** 26 jugadores oficiales (RFEF, mayo 2026) — 3 GK, 8 DEF, 7 MID, 8 FWD.

---

### `spain_lineups` — Alineaciones de España por usuario

```sql
id           uuid        PRIMARY KEY DEFAULT gen_random_uuid()
user_id      uuid        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE
match_id     uuid        REFERENCES matches(id) ON DELETE SET NULL
formation    text        NOT NULL DEFAULT '4-3-3'
slots        jsonb       NOT NULL DEFAULT '{}'  -- { "GK": uuid, "DEF_1": uuid, ... }
note         text        -- texto del usuario al publicar
is_published boolean     DEFAULT false          -- true = aparece en FanZone/Feed
created_at   timestamptz DEFAULT now()
updated_at   timestamptz DEFAULT now()

UNIQUE (user_id, match_id)
```

**RLS:**
- `SELECT`: published OR user_id = auth.uid()
- `ALL`: user_id = auth.uid()

---

## Orden de Migraciones

```
supabase/migrations/
  00_extensions.sql          → uuid-ossp, pgcrypto, pg_trgm
  01_profiles.sql            → tabla profiles + trigger handle_new_user
  02_teams.sql               → tabla teams (id = TEXT código FIFA)
  03_matches.sql             → matches + match_events + trigger updated_at
  04_predictions.sql         → tabla predictions
  05_leagues.sql             → leagues + league_members
  06_leaderboard.sql         → leaderboard_cache + función score_match_predictions
  07_social.sql              → match_comments + match_reactions + activity_feed
  08_achievements.sql        → achievements + user_achievements
  09_rls_policies.sql        → TODAS las políticas RLS
  10_indexes.sql             → todos los índices
  11_functions.sql           → funciones SQL adicionales
  12_seed_teams.sql          → 48 equipos del Mundial 2026
  13_seed_matches.sql        → calendario (cuando esté disponible)

  -- Migraciones de features FASE 1+
  005_spain_squad.sql        → spain_squad + spain_lineups + seed 26 jugadores oficiales
  006_profile_surprise_team  → profiles.surprise_team_id TEXT (FK a teams.id)
```

⚠️ El numbering real de las migraciones en el proyecto empieza en `005_` porque las primeras cuatro (inicial, teams, matches, predictions) se crearon en la migración inicial.
