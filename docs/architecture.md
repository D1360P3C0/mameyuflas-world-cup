# Arquitectura Técnica — Mameyuflas World Cup

## Principios de Diseño

1. **Seguridad por defecto**: RLS en todas las tablas, validación en cliente Y servidor
2. **Server-first**: Preferir Server Components y Server Actions sobre Client Components
3. **Feature isolation**: Cada módulo de feature es independiente
4. **Type safety end-to-end**: Tipos generados desde Supabase hasta la UI
5. **Realtime selectivo**: Solo donde el UX lo justifica (Match Center, Leaderboard)

---

## Diagrama de Capas

```
┌─────────────────────────────────────────────┐
│              VERCEL EDGE                     │
│  middleware.ts — Auth check + token refresh  │
└───────────────────────┬─────────────────────┘
                        │
┌───────────────────────▼─────────────────────┐
│           NEXT.JS APP ROUTER                 │
│  ┌─────────────┐  ┌──────────────────────┐  │
│  │   Server    │  │   Client Components  │  │
│  │ Components  │  │  (islands of JS)     │  │
│  │ + Actions   │  │                      │  │
│  └──────┬──────┘  └──────────┬───────────┘  │
└─────────┼────────────────────┼─────────────┘
          │                    │
┌─────────▼────────────────────▼─────────────┐
│              SUPABASE                        │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │   Auth   │  │PostgreSQL│  │ Realtime │  │
│  │   JWT    │  │  + RLS   │  │  (WS)    │  │
│  └──────────┘  └──────────┘  └──────────┘  │
│              ┌──────────┐                   │
│              │ Storage  │                   │
│              │(Avatares)│                   │
│              └──────────┘                   │
└─────────────────────────────────────────────┘
```

---

## Decisiones Técnicas

### ¿Por qué Next.js 15 App Router?

- Route Groups `(auth)`, `(main)`, `(admin)` organizan rutas sin afectar URL
- Server Components reducen el bundle de JS al cliente
- Server Actions simplifican mutaciones sin endpoints API separados
- Streaming con Suspense mejora UX en Match Center en tiempo real
- Compatible con Vercel Edge Runtime para latencia mínima

### ¿Por qué NO Prisma?

| Criterio | Con Prisma | Sin Prisma (Supabase directo) |
|---|---|---|
| RLS | Prisma bypasea RLS (conecta como service_role) | Supabase client respeta RLS con JWT del usuario |
| Realtime | No compatible | `supabase.channel()` integrado |
| Auth | Sincronización manual | `supabase.auth.getUser()` automático |
| Type safety | Prisma genera tipos | `supabase gen types typescript` — equivalente |
| Serverless cold starts | Prisma Client es pesado | Supabase client es ligero |
| Complejidad | Dos capas de acceso a datos | Una sola fuente de verdad |

**Conclusión**: Prisma añade complejidad sin beneficios reales en este stack.

### ¿Por qué TanStack Query v5?

Mejor soporte para mutaciones optimistas, invalidación granular de cache por
`queryKey`, devtools integrado, y es el estándar de facto en proyectos Next.js 2025+.

### ¿Por qué Zustand v5?

Context re-renderiza todo el árbol en cada cambio. Zustand es selectivo (subscripciones
por slice), mínimo boilerplate, y suficiente para el state de UI de MWC.

### ¿Por qué Tailwind v4 sin tailwind.config.ts?

Tailwind v4 usa configuración CSS-based con `@theme inline { }` directamente en
`globals.css`. No necesitamos un archivo de configuración separado. Los tokens MWC
van en `globals.css` como CSS variables bajo la directiva `@theme`.

---

## Flujos de Datos

### Flujo de Autenticación

```
1. Usuario visita ruta protegida (main)
2. middleware.ts intercepta → createMiddlewareClient
3. supabase.auth.getSession() — sin sesión → redirect /login
4. Con sesión → refresh si está próxima a expirar
5. Continúa a la ruta → Server Component
6. Server Component crea createServerClient (cookies)
7. supabase.auth.getUser() para datos del usuario autenticado
8. Renderiza con datos del usuario
```

### Flujo de Datos en Server Component

```
Server Component
  → createServerClient (lib/supabase/server.ts)
  → supabase.from('tabla').select('...')
  → RLS filtra automáticamente según el usuario
  → Datos tipados con Database['public']['Tables']['tabla']['Row']
  → Props a Client Components si necesitan interactividad
```

### Flujo de Datos en Client Component

```
Client Component
  → useQuery({ queryKey: ['matches'], queryFn: fetchMatches })
  → fetchMatches → createBrowserClient → supabase.from('matches').select()
  → TanStack Query: cachea, revalida, gestiona loading/error
  → Zustand: estado local de UI (filtros, modales)
```

### Flujo de Mutación (Server Action)

```
Client Component (formulario)
  → React Hook Form + Zod (validación en cliente)
  → form.handleSubmit → Server Action (features/predictions/actions/)
  → Zod (validación en servidor — nunca confiar solo en cliente)
  → createServerClient → supabase.from('predictions').insert()
  → RLS verifica auth.uid() = user_id
  → Retorna resultado al Client Component
  → TanStack Query invalida cache relacionado
```

### Flujo Realtime (Match Center)

```
Match Center page (Client Component)
  → createBrowserClient
  → supabase.channel('match-[id]')
      .on('postgres_changes', { event: '*', table: 'match_events' })
      .subscribe()
  → Nuevos eventos → actualizar estado local → re-render
  → useEffect cleanup → desuscripción automática
```

---

## Estructura de Módulos de Features

Cada feature sigue este patrón y **NO importa directamente de otro feature**:

```
features/predictions/
  components/    → UI específica de predicciones
  actions/       → Server Actions (insertar, actualizar predicciones)
  hooks/         → useUserPredictions, usePredictionDeadline
  utils/         → calcularPuntos, validarDeadline
  index.ts       → export público (solo lo que otros necesitan)
```

Si dos features necesitan compartir algo → va a `lib/` o `types/`.

---

## Deployment

- **Vercel** — hosting principal
- **Supabase** — backend as a service
- **GitHub** — repositorio + CI/CD (lint + type-check en PRs)
- Environments: `development` (local), `preview` (Vercel PR), `production`

## Rendimiento

- Server Components por defecto — cero JS al cliente donde sea posible
- Imágenes con `next/image` + lazy loading
- Fuentes con `next/font` (sin layout shift)
- Suspense + `loading.tsx` en rutas pesadas
- TanStack Query DevTools solo en development
