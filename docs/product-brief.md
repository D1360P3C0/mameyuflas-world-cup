# Product Brief — Mameyuflas World Cup

## Visión

Una aplicación web que convierta ver el Mundial 2026 en una experiencia social y
competitiva para grupos de amigos. Combina la emoción de una porra clásica con la
profundidad de un juego de predicciones completo, envuelta en una estética de
videojuego deportivo de los años 2000.

## Usuario Objetivo

- Grupos de amigos (5–50 personas) que siguen el fútbol
- Rango de edad: 25–45 años
- Dispositivo principal: móvil (60%), escritorio (40%)
- Familiarizados con apps de fútbol (FIFA, PES, Sofascore, Biwenger)

## Propuesta de Valor

**Para el usuario:**
- Una sola app para todas las predicciones del Mundial
- Competir con amigos en ligas privadas
- Seguir partidos en tiempo real con datos enriquecidos
- Sentir que "juegan" al Mundial, no solo lo ven

**Diferenciadores:**
- Estética única de videojuego retro (PES6-inspired)
- Sistema de predicciones más completo (premios individuales, brackets)
- Match Center con comentarios y reacciones en tiempo real

---

## Funcionalidades Principales

### 0. Registro con "Ojito con 🔥"

Flujo de registro de 2 pasos:
1. **Paso 1**: email, username, nombre, contraseña
2. **Paso 2**: elige una selección que crees que dará la sorpresa en el Mundial ("Ojito con")

La elección queda guardada en el perfil y visible públicamente. El usuario puede saltarla y elegirla después.

**12 selecciones disponibles**: Marruecos, Japón, Senegal, Australia, Túnez, Corea del Sur, Egipto, Irán, Türkiye, Arabia Saudí, Ecuador, Nigeria. Las banderas se muestran como imágenes reales (flagcdn.com).

---

### 1. Sistema de Predicciones

Menú: **Predicciones** (`/predictions`) con 3 vistas internas:

- **Grupos**: resultado exacto (marcador) de cada partido de la fase de grupos, predicción de clasificados por grupo
- **Bracket**: avance en eliminatorias (octavos, cuartos, semis, final), campeón y subcampeón — vista con esquema visual
- **Especiales**: máximo goleador, mejor jugador (MVP), mejor portero, mejor jugador joven

**Deadline**: predicciones se bloquean 1 hora antes del partido correspondiente.

---

### 1b. XI España (`/spain-xi`)

Selector interactivo de alineación inicial de España para cada partido:
- Selección de formación: 4-3-3, 4-4-2, 4-2-3-1, 3-5-2
- Campo de fútbol visual con jugadores posicionados por coordenadas
- Jugadores del squad oficial (tabla `spain_squad` en Supabase, 26 jugadores RFEF)
- Publicación en el Tablón (FanZone/Feed) con nota del usuario
- Diferenciados por posición: GK 🟡 / DEF 🔵 / MID 🩵 / FWD 🩷

---

### 2. Match Center (por partido)

- Marcador en tiempo real
- Alineaciones (titulares y suplentes)
- Eventos: goles, asistencias, tarjetas amarillas/rojas, cambios
- Estadísticas (posesión, tiros, corners, etc.)
- Comentarios de usuarios en tiempo real
- Reacciones rápidas (emoji reactions)
- Predicciones del usuario para ese partido

### 3. Leaderboard

- Ranking global de todos los usuarios
- Ranking por liga privada
- Histórico de puntuación por ronda
- Tabla de quién sube/baja más

### 4. Ligas Privadas

- Crear liga con nombre personalizado
- Código de invitación único (6 caracteres)
- Límite configurable de participantes
- Leaderboard propio de la liga

### 5. Perfil de Usuario

- Avatar (subido o generado)
- Estadísticas de predicciones
- Historial de partidos
- Badges y logros

### 6. FanZone y Feed Social

**FanZone mini** (visible en `/dashboard` entre "Próximo Partido" y "Flash News"):
- Quick-post de texto
- Enlace directo a publicar XI España
- Últimos posts del tablón con likes, comentarios y compartir

**FanZone completa** (`/fanzone`):
- Tablón de posts completo (texto + alineaciones publicadas de España)
- "Ana acertó el resultado de España vs Marruecos"
- "Carlos subió al puesto 3 en la liga de los Amigos del Bar"
- Reacciones a predicciones y posts ajenos

### 7. Noticias (Fase 6)

- Feed automático desde RSS de fuentes deportivas
- Sin curaduría manual
- Filtrado por equipo o fase del torneo

---

## Restricciones

- Sin dinero real (no es una casa de apuestas)
- Sin derechos de imagen protegidos (logos de equipos: solo libres de uso)
- Sin assets de PES ni de FIFA
- Cumplimiento GDPR básico

---

## Métricas de Éxito

- DAU durante el Mundial: objetivo 80%+ de usuarios registrados activos
- Retención: usuario que regresa cada día de partido
- Ligas creadas: objetivo promedio 2 ligas por usuario registrado
- Predicciones completadas: objetivo 100% de usuarios rellenan predicciones de grupos

---

## Timeline

El Mundial 2026 es en junio–julio 2026.

**Deadline crítico:** FASE 1 + FASE 2 en producción antes del inicio del Mundial
(junio 2026) para que los usuarios puedan registrarse y hacer predicciones de grupos
anticipadas.

Hito ideal: tener la app con registro abierto en febrero–marzo 2026 para marketing
previo al Mundial.
