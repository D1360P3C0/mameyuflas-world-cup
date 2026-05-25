# Dirección de UI/UX — Mameyuflas World Cup

## Concepto Visual

**"Ultra-Strike" — Dark neon gaming UI**

La interfaz es oscura, neon y cinética. Fondo casi negro con acentos pink, purple y cyan
que crean profundidad y jerarquía visual. Inspirada en UIs de videojuegos deportivos modernos
(FC 25, eFootball) y apps de esports. Glow effects, gradientes, glassmorphism sutil.

**NO es una app de noticias deportivas con blanco y azul.**
Es una plataforma de competición social con estética de videojuego.

**NO se usan logos, assets, ni material protegido de ningún videojuego.**

---

## Paleta de Colores

Los tokens CSS van en `app/globals.css` bajo la directiva `@theme inline`:

### Fondos y Superficies (oscuro)

```css
--color-mwc-bg:          #0F0F1E;   /* body background */
--color-mwc-surface:     #1A1A2E;   /* cards, panels */
--color-mwc-surface-2:   #16213E;   /* superficie elevada */
--color-mwc-surface-3:   #0D3B66;   /* superficie activa */
```

### Pink — Acento Primario (CTAs, highlights)

```css
--color-mwc-pink-700: #c4326a;
--color-mwc-pink-600: #e0447f;
--color-mwc-pink-500: #FF5E9F;   /* CTA principal */
--color-mwc-pink-400: #ff7db3;
--color-mwc-pink-300: #ffadd0;
```

### Purple — Acento Secundario (ranking, badges, gradientes)

```css
--color-mwc-purple-700: #6d28d9;
--color-mwc-purple-600: #7c3aed;
--color-mwc-purple-500: #8B5CF6;   /* secundario */
--color-mwc-purple-400: #a78bfa;
```

### Cyan — Terciario (live, datos en tiempo real)

```css
--color-mwc-cyan-500: #00F5FF;   /* live, highlights */
--color-mwc-cyan-400: #33f7ff;
```

### Texto

```css
--color-mwc-text:   #ffffff;
--color-mwc-text-2: rgba(255,255,255,0.70);  /* secundario */
--color-mwc-text-3: rgba(255,255,255,0.40);  /* muted */
```

### Gradientes Clave

```css
--mwc-gradient-primary:  linear-gradient(135deg, #FF5E9F 0%, #8B5CF6 100%);
--mwc-gradient-hero:     linear-gradient(160deg, #0F0F1E 0%, #1A1A2E 50%, #16213E 100%);
--mwc-gradient-auth:     radial-gradient(ellipse at top, #1A1A2E 0%, #0F0F1E 70%);
```

---

## Tipografía

Fuentes via `next/font/google`:

```
Headings:  Sora — geométrica, moderna, impactante. Uppercase, bold.
Body:      Manrope — muy legible, humanista. Para textos y labels.
Mono:      JetBrains Mono — marcadores, números alineados, stats.
```

### Variables CSS

```css
--font-heading: var(--font-sora);
--font-sans:    var(--font-manrope);
--font-mono:    var(--font-jetbrains-mono);
```

### Escala

```
Display:  3rem+,  Sora 800, uppercase, letter-spacing -0.02em
H1:       2rem,   Sora 700, uppercase
H2:       1.5rem, Sora 700
H3:       1.25rem, Sora 600
Body lg:  1.125rem, Manrope 400
Body:     1rem,   Manrope 400
Body sm:  0.875rem, Manrope 400
Score:    3rem,   JetBrains Mono 800, letter-spacing 0.05em
Label:    0.7rem, Manrope 700, uppercase, letter-spacing 0.1em
```

---

## Componentes — Reglas de Diseño

### Cards

```
background:    #1A1A2E
border:        1px solid rgba(255, 255, 255, 0.08)
border-radius: 16px (rounded-2xl)
box-shadow:    0 4px 24px rgba(0, 0, 0, 0.4)
hover glow:    0 0 20px rgba(255, 94, 159, 0.15) — opcional
transition:    200ms ease
```

### Botones

**Primary (pink):**
```
background:  #FF5E9F
color:       white
hover:       #e0447f + glow pink
border-radius: 12px (rounded-xl)
```

**Secondary (purple):**
```
background:  #8B5CF6
color:       white
hover:       #7c3aed + glow purple
```

**Outline (pink):**
```
border:      1px solid rgba(255, 94, 159, 0.5)
color:       #FF5E9F
hover:       bg rgba(255, 94, 159, 0.1)
```

**Cyan (live / datos):**
```
border:      1px solid rgba(0, 245, 255, 0.4)
color:       #00F5FF
hover:       bg rgba(0, 245, 255, 0.1) + glow cyan
```

### Inputs

```
background:   rgba(255,255,255,0.06)
border:       1px solid rgba(255, 255, 255, 0.1)
border-focus: rgba(255, 94, 159, 0.6) + ring rgba(255,94,159,0.2)
border-radius: 12px
color:        white
placeholder:  rgba(255,255,255,0.3)
```

### Navbar y Sidebar

```
background:   #0F0F1E / 95% + backdrop-blur
border:       1px solid rgba(255,255,255,0.06)
logo icon:    gradient pink→purple + glow
items activos: color #FF5E9F + bg rgba(255,94,159,0.12) + dot pink
items hover:   texto white + bg rgba(255,255,255,0.06)
mobile:        bottom navigation bar (4 tabs, no hamburger)
```

**BottomNav — 4 tabs actuales:**

| Icono | Label | Ruta |
|-------|-------|------|
| `home` | Inicio | /dashboard |
| `sports_soccer` | Predicciones | /predictions |
| `flag` | XI España | /spain-xi |
| `leaderboard` | Ranking | /leaderboard |

### Banderas de Países

⚠️ **No usar emoji de banderas** — Windows no los renderiza (🇲🇦 aparece como letras "MA").

Usar imágenes de `flagcdn.com`:

```tsx
function flagUrl(code: string, size: 40 | 80 = 40) {
  return `https://flagcdn.com/w${size}/${code.toLowerCase()}.png`
}
// Ejemplo: <img src={flagUrl('MA')} width={32} height={24} className="rounded-sm object-cover" />
```

El código es ISO 3166-1 alpha-2 (2 letras, minúsculas): `ma`, `jp`, `sn`, `au`, `tn`, `kr`, `eg`, `ir`, `tr`, `sa`, `ec`, `ng`.

### Marcadores de Partido

```
equipo: logo + nombre en Sora, uppercase
marcador: 3rem+, JetBrains Mono, blanco
separador: "–" en #FF5E9F
estado: badge LIVE (cyan pulsante) | FIN (blanco/40) | HOY (purple)
```

---

## Efectos y Animaciones

### Glows Neon

```css
--mwc-glow-pink:   0 0 20px rgba(255, 94, 159, 0.35), 0 0 40px rgba(255, 94, 159, 0.15);
--mwc-glow-purple: 0 0 20px rgba(139, 92, 246, 0.35), 0 0 40px rgba(139, 92, 246, 0.15);
--mwc-glow-cyan:   0 0 20px rgba(0, 245, 255, 0.35), 0 0 40px rgba(0, 245, 255, 0.15);
```

Clases: `.mwc-glow-pink`, `.mwc-glow-purple`, `.mwc-glow-cyan`

### Patrones de Fondo

```css
/* Dot grid: 24×24px, puntos blancos 6% de opacidad */
.mwc-dot-grid {
  background-image: radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px);
  background-size: 24px 24px;
}
```

### Texto Gradiente

```css
.mwc-text-gradient {
  background: linear-gradient(135deg, #FF5E9F, #8B5CF6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
```

### Reglas de Animación

- Transiciones: máximo 300ms, ease o ease-out
- Loading states: skeleton screens con shimmer (#1A1A2E → #252540)
- Entrada de páginas: fade-in sutil (200ms)
- Glows en hover, no permanentes (salvo elementos live)
- No animar cosas que el usuario no ha iniciado

---

## Responsive — Mobile First

Breakpoints Tailwind v4 en `globals.css`:

```
sm:  640px   → Móviles grandes
md:  768px   → Tablets / Desktop pequeño
lg:  1024px  → Desktop
xl:  1280px  → Desktop grande
```

### Patrones Mobile Obligatorios

- **Bottom navigation** en mobile (no hamburger) — 5 tabs: Inicio | Grupos | Especiales | Ranking | Perfil
- Cards de partido: stack vertical en mobile, grid 2-3 col en desktop
- Leaderboard: tabla simplificada en mobile (posición, avatar, nombre, puntos)
- Match Center: tabs para secciones (Marcador | Stats | Comentarios)

---

## Lo que NO hacer en UI

- ❌ Fondos blancos o claros en ninguna pantalla de la app
- ❌ Verde césped como color de marca
- ❌ Fuentes serif o script
- ❌ Hardcodear colores — usar las CSS variables `--mwc-*`
- ❌ Hardcodear strings de rutas — usar `lib/constants/routes.ts`
- ❌ Más de 3 colores de acento en un mismo componente
- ❌ Animar cosas sin interacción del usuario (salvo live dot)
- ❌ Border radius > 20px en componentes principales
- ❌ Sombras claras — solo sombras oscuras y glows neon
- ❌ `"use client"` innecesariamente — preferir Server Components
