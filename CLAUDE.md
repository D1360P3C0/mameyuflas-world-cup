@AGENTS.md

# Mameyuflas World Cup — Guía para el Agente de IA

## Descripción del Proyecto

Mameyuflas World Cup (MWC) es una aplicación web de porra futbolística inspirada en
el Mundial 2026. Combina predicciones avanzadas, rankings, ligas privadas, un Match
Center con datos en tiempo real, y elementos sociales y de gamificación.

El nombre "Mameyuflas" es coloquial y amigable — el tono de la app es competitivo pero
divertido, nunca corporativo.

---

## Stack Técnico

| Capa | Tecnología | Versión instalada |
|---|---|---|
| Framework | Next.js (App Router) | 16.2.6 (≡ Next.js 15.x) |
| Lenguaje | TypeScript | 5.x strict |
| Backend/DB | Supabase (PostgreSQL + Auth + Realtime + Storage + RLS) | @supabase/supabase-js 2.x |
| SSR integration | @supabase/ssr | 0.10.x |
| ORM | **NINGUNO** — usar Supabase client directo | — |
| Estado servidor | TanStack Query | v5 |
| Estado cliente | Zustand | v5 |
| Validación | Zod | v4 (no v3 — hay diferencias de API) |
| Estilos | Tailwind CSS v4 (CSS-based config, sin tailwind.config.ts) | v4 |
| Animaciones | Framer Motion | v12 |
| Formularios | React Hook Form | v7 |
| Deployment | Vercel | — |
| Fechas | date-fns | v4 |

**REGLA CRÍTICA: NO instalar Prisma. NO usar Prisma. El cliente de Supabase maneja
todo el acceso a datos y respeta RLS automáticamente.**

### Nota sobre Tailwind v4
Tailwind v4 NO usa `tailwind.config.ts`. La configuración va directamente en
`app/globals.css` usando directivas `@theme inline { ... }`. Para añadir tokens
de diseño personalizados, editar `app/globals.css`.

### Nota sobre proxy.ts (antes middleware.ts)
En Next.js 15 (versión instalada: 16.2.6), el archivo `middleware.ts` fue renombrado a
`proxy.ts` y la función exportada se llama `proxy` (no `middleware`).
**Usar siempre `proxy.ts` en la raíz del proyecto.**

### Nota sobre Zod v4
Zod v4 tiene cambios de API respecto a v3. Ver docs en https://zod.dev

---

## Objetivo del Producto

Convertir el Mundial 2026 en una experiencia social y competitiva para grupos de amigos.
Una porra clásica potenciada con predicciones completas, Match Center en tiempo real,
ligas privadas y gamificación. Estética de videojuego deportivo retro (PES6-inspired).

## Público Objetivo

- Grupos de amigos (5–50 personas) que siguen el fútbol
- Rango de edad: 25–45 años
- Dispositivo principal: móvil (60%), escritorio (40%)
- Familiarizados con apps de fútbol (FIFA, PES, Sofascore, Biwenger)

---

## Features Principales

1. **Predicciones**: resultado exacto, campeón, subcampeón, goleador, MVP, portero, joven
2. **Clasificaciones de grupos y eliminatorias** (bracket completo)
3. **Leaderboard** global y por liga con puntos en tiempo real
4. **Ligas privadas** por código de invitación
5. **Match Center** por partido (marcador, eventos, estadísticas, comentarios)
6. **Perfil de usuario** con historial, badges y estadísticas
7. **Feed social** de actividad entre amigos
8. **Sistema de puntuación** configurable

## Features Futuras (No Implementar Todavía)

- Noticias automáticas via RSS/APIs externas (FASE 6)
- Actualización automática de marcadores via API-Football (FASE 6)
- Notificaciones push (FASE 5)
- Chat de liga (FASE 5+)
- Badges y logros complejos (FASE 5)

---

## Estructura de Carpetas

```
app/          → Rutas Next.js App Router
  (auth)/     → Páginas sin autenticación (login, register)
  (main)/     → Páginas de la app autenticada
  (admin)/    → Panel de administración
  api/        → Route Handlers de Next.js
components/   → Componentes reutilizables globales
  ui/         → Átomos de UI
  layout/     → Estructura de página (navbar, sidebar, providers)
features/     → Módulos de funcionalidad (lógica + UI específica)
lib/          → Utilidades, helpers, configuración
  supabase/   → Clientes de Supabase (browser, server, middleware)
  utils/      → Funciones de utilidad puras
  validations/→ Schemas de Zod
  constants/  → Constantes de la aplicación
types/        → Definiciones de TypeScript
styles/       → (reservado para CSS global adicional)
supabase/     → Migraciones SQL y seed
docs/         → Documentación técnica del proyecto
```

---

## Convenciones de Código

### Naming

- **Componentes React**: PascalCase — `MatchCard.tsx`, `LeagueTable.tsx`
- **Hooks**: camelCase con prefijo `use` — `useCurrentUser.ts`, `useMatchRealtime.ts`
- **Server Actions**: camelCase con sufijo `.actions.ts` — `auth.actions.ts`
- **Utilidades**: camelCase — `cn.ts`, `formatScore.ts`
- **Schemas Zod**: camelCase con sufijo `Schema` — `loginSchema`, `predictionSchema`
- **Types DB**: PascalCase con sufijo Row/Insert/Update — `MatchRow`, `ProfileInsert`
- **Constantes**: SCREAMING_SNAKE_CASE — `MAX_LEAGUES_PER_USER`, `SCORING_RULES`
- **CSS variables**: kebab-case con prefijo `--mwc-` — `--mwc-gold-500`, `--mwc-navy-900`
- **Route segments**: kebab-case — `/match-center/[matchId]`

### Estructura de un Feature Module

```
features/[nombre]/
  components/     → Componentes específicos del feature
  actions/        → Server Actions (mutaciones)
  hooks/          → Custom hooks del feature
  utils/          → Utilidades específicas del feature
  index.ts        → Barrel export (solo lo público)
```

### Imports

- Usar path aliases: `@/components`, `@/lib`, `@/features`, `@/types`
- NO usar imports relativos de más de un nivel (`../../`)
- Orden: 1) React/Next.js, 2) Librerías externas, 3) Internos con alias, 4) Tipos

### TypeScript

- `strict: true` siempre
- No usar `any` — usar `unknown` + narrowing
- Tipos de DB vienen de `types/database.types.ts` (generado por Supabase CLI)
- Tipos de dominio en `types/app.types.ts`

---

## Reglas de Supabase y Seguridad

### Tres clientes distintos — usar el correcto según contexto

```typescript
// En Client Components (browser)
import { createBrowserClient } from '@/lib/supabase/client'

// En Server Components, Server Actions, Route Handlers
import { createServerClient } from '@/lib/supabase/server'

// En middleware.ts ÚNICAMENTE
import { createMiddlewareClient } from '@/lib/supabase/middleware'
```

**NUNCA usar SUPABASE_SERVICE_ROLE_KEY en el cliente del browser.**
**NUNCA poner SUPABASE_SERVICE_ROLE_KEY en variables NEXT_PUBLIC_.**

### Row Level Security (RLS)

- TODAS las tablas deben tener RLS habilitado
- Escribir políticas explícitas para SELECT, INSERT, UPDATE, DELETE
- No filtrar por `user_id` solo en la app — la DB filtra con RLS
- Service role key (bypass de RLS): solo en Server Actions de admin verificadas

### Autenticación

- Middleware en `middleware.ts` (raíz) refresca tokens en cada request
- Proteger rutas en el middleware, no solo en el componente
- `(main)` y `(admin)` requieren sesión activa
- Admin: verificar `profile.is_admin` en el servidor, no en el cliente

### Variables de Entorno

- `NEXT_PUBLIC_*` — solo valores no secretos (URL y anon key de Supabase)
- Sin prefijo — secretos del servidor (service role, API keys externas)
- Nunca commitear `.env.local`

---

## Sistema de Puntuación (Referencia — implementar en FASE 2)

Configurado en `lib/constants/scoring.ts`. Valores base:

| Predicción | Puntos |
|---|---|
| Resultado exacto (marcador) | 3 |
| Resultado correcto (ganador/empate) | 1 |
| Campeón acertado | 10 |
| Subcampeón acertado | 5 |
| Máximo goleador | 8 |
| Mejor jugador (MVP) | 6 |
| Mejor portero | 4 |
| Mejor jugador joven | 4 |
| Equipo en semifinales | 3 |
| Equipo en cuartos | 2 |
| Clasificación exacta de grupo (posición) | 2 |
| Clasificación de grupo (pasa, posición incorrecta) | 1 |

La lógica de cálculo va en `lib/utils/scoring.ts`.

---

## Fases del Proyecto

### FASE 0 — Estructura Base ✅ (ACTUAL)
Setup, estructura de carpetas, documentación, configuración. Sin lógica de negocio.

### FASE 1 — Autenticación y Layout
- Login/Register con Supabase Auth (email/password + OAuth Google)
- Middleware de protección de rutas
- Layout principal (navbar, sidebar, bottom nav mobile)
- Página de perfil básica
- Sistema de diseño: componentes UI base con look PES6
- Trigger SQL para auto-crear `profiles` al registrarse

### FASE 2 — Predicciones
- Formulario de predicciones fase de grupos
- Predicciones de eliminatorias (bracket)
- Predicciones de premios (campeón, goleador, MVP, portero, joven)
- Bloqueo automático 1h antes del partido
- Almacenamiento en Supabase con RLS

### FASE 3 — Match Center
- Página de partido individual
- Marcador (actualización manual por admin)
- Alineaciones, goles, asistencias, tarjetas, cambios
- Realtime con Supabase Realtime
- Comentarios y reacciones por partido

### FASE 4 — Ligas y Leaderboard
- Ligas privadas con código de invitación
- Leaderboard global y por liga en tiempo real
- Rankings y tabla de posiciones

### FASE 5 — Social y Gamificación
- Feed de actividad entre amigos
- Comparación de predicciones
- Badges y logros
- Notificaciones

### FASE 6 — Noticias y Automatización
- RSS feeds de noticias deportivas
- APIs externas de datos de partidos (API-Football)
- Actualización automática de marcadores

### FASE 7 — Polish y Producción
- Optimización de rendimiento
- SEO completo
- Tests E2E
- Monitoreo (Sentry, Vercel Analytics)

---

## Comandos Útiles

```bash
# Desarrollo
npm run dev

# Verificar tipos
npm run type-check

# Build de producción
npm run build

# Generar tipos de Supabase (requiere SUPABASE_PROJECT_ID en env)
npm run supabase:types

# Aplicar migraciones
npx supabase db push

# Reset de DB local (Supabase CLI)
npx supabase db reset
```

---

## Lo que NO hacer

- NO instalar ni mencionar Prisma
- NO usar `any` en TypeScript — usar `unknown` + narrowing
- NO exponer `SUPABASE_SERVICE_ROLE_KEY` en el cliente
- NO deshabilitar RLS en ninguna tabla de producción
- NO hardcodear colores — usar las CSS variables `--mwc-*`
- NO hardcodear strings de rutas — usar `lib/constants/routes.ts`
- NO importar features entre sí directamente — usar `lib/` o `types/` como puente
- NO crear `tailwind.config.ts` — Tailwind v4 usa configuración CSS en `globals.css`
- NO usar `"use client"` innecesariamente — preferir Server Components

---

## Diseño UI — Reglas Rápidas (Ultra-Strike)

- **Fondo principal**: `#0F0F1E` (near-black)
- **Cards**: `#1A1A2E` con `border: 1px solid rgba(255,255,255,0.08)`
- **CTA principal**: `#FF5E9F` (pink) — texto blanco
- **Acento secundario**: `#8B5CF6` (purple)
- **Live / datos**: `#00F5FF` (cyan)
- **Texto principal**: blanco (`#ffffff`)
- **Texto secundario**: `rgba(255,255,255,0.6)`
- **Tipografía headings**: Sora, uppercase, bold
- **Tipografía body**: Manrope
- **Tipografía mono**: JetBrains Mono (marcadores, stats)
- **Mobile-first siempre**
- **Bottom navigation en móvil** (no hamburger)
- Sin fondos blancos ni claros en ninguna pantalla de la app
- NO usar colores del tema anterior (navy, gold, orange, blue) — están eliminados
- Ver `docs/ui-direction.md` para referencia completa

---

## Glosario

- **Porra**: Sistema de predicciones y apuestas sin dinero real
- **Match Center**: Página dedicada a un partido con datos en tiempo real
- **Liga privada**: Grupo cerrado de usuarios que compiten entre sí
- **MWC**: Abreviatura de Mameyuflas World Cup
- **Admin**: Usuario con `is_admin = true` que puede actualizar resultados
- **RLS**: Row Level Security de PostgreSQL (vía Supabase)
- **Route Group**: Carpeta `(nombre)` en Next.js App Router que agrupa rutas sin afectar URL
