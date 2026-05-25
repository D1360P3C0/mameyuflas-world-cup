# Mameyuflas World Cup ⚽🏆

> Porra avanzada del Mundial 2026 — predicciones, rankings, ligas privadas y Match Center en tiempo real.

## Stack

| Capa | Tecnología |
|---|---|
| Framework | Next.js 15 (App Router) |
| Backend/DB | Supabase (Auth, PostgreSQL, Realtime, Storage, RLS) |
| Estado | TanStack Query v5 + Zustand v5 |
| Validación | Zod v4 |
| Estilos | Tailwind CSS v4 |
| Deployment | Vercel |

## Requisitos

- Node.js 20+
- npm 10+
- Cuenta de [Supabase](https://supabase.com)

## Setup Local

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar variables de entorno
cp .env.example .env.local
# Editar .env.local con tus credenciales de Supabase

# 3. Iniciar servidor de desarrollo
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

## Scripts

| Comando | Descripción |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción |
| `npm run type-check` | Verificación de tipos TypeScript |
| `npm run lint` | Linting con ESLint |
| `npm run supabase:types` | Generar tipos desde Supabase |

## Estructura

Ver [docs/architecture.md](docs/architecture.md) para la documentación completa.

## Fases de Desarrollo

| Fase | Descripción | Estado |
|---|---|---|
| FASE 0 | Setup y estructura base | ✅ Completada |
| FASE 1 | Autenticación y layout | ⏳ Pendiente |
| FASE 2 | Predicciones | ⏳ Pendiente |
| FASE 3 | Match Center | ⏳ Pendiente |
| FASE 4 | Ligas y Leaderboard | ⏳ Pendiente |
| FASE 5 | Social y Gamificación | ⏳ Pendiente |
| FASE 6 | Noticias y Automatización | ⏳ Pendiente |
| FASE 7 | Polish y Producción | ⏳ Pendiente |

## Documentación

- [Product Brief](docs/product-brief.md)
- [Arquitectura](docs/architecture.md)
- [UI Direction](docs/ui-direction.md)
- [Plan de Base de Datos](docs/database-plan.md)
- [Guía del Agente](CLAUDE.md)

---

*Proyecto privado. Todos los derechos reservados.*
