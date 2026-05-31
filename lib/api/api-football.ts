// API-Football v3 via RapidAPI
// Docs: https://www.api-football.com/documentation-v3

const BASE_URL = 'https://api-football-v1.p.rapidapi.com/v3'

function getHeaders(): HeadersInit {
  const key = process.env.API_FOOTBALL_KEY
  if (!key) throw new Error('API_FOOTBALL_KEY no está configurada en las variables de entorno')
  return {
    'X-RapidAPI-Key': key,
    'X-RapidAPI-Host': 'api-football-v1.p.rapidapi.com',
  }
}

async function apiFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: getHeaders(),
    cache: 'no-store',
  })

  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(`API-Football ${res.status}: ${body.slice(0, 200)}`)
  }

  const json = await res.json()

  if (json.errors && Object.keys(json.errors).length > 0) {
    throw new Error(`API-Football error: ${JSON.stringify(json.errors)}`)
  }

  return json.response as T
}

// ── Types ────────────────────────────────────────────────────────

export interface ApiFixtureStatus {
  long: string
  short: string
  elapsed: number | null
}

export interface ApiScore {
  home: number | null
  away: number | null
}

export interface ApiFixture {
  fixture: {
    id: number
    referee: string | null
    timezone: string
    date: string
    status: ApiFixtureStatus
  }
  league: {
    id: number
    name: string
    season: number
    round: string
  }
  teams: {
    home: { id: number; name: string; logo: string; winner: boolean | null }
    away: { id: number; name: string; logo: string; winner: boolean | null }
  }
  goals: ApiScore
  score: {
    halftime: ApiScore
    fulltime: ApiScore
    extratime: ApiScore
    penalty: ApiScore
  }
}

export interface ApiPlayerStats {
  player: {
    id: number
    name: string
    firstname: string
    lastname: string
    photo: string
  }
  statistics: Array<{
    team: { id: number; name: string; logo: string }
    goals: {
      total: number | null
      assists: number | null
      conceded: number | null
      saves: number | null
    }
    games: {
      appearences: number | null
      minutes: number | null
    }
  }>
}

// ── Endpoints ────────────────────────────────────────────────────

/** Devuelve un fixture por su ID */
export async function getFixture(fixtureId: number): Promise<ApiFixture | null> {
  const data = await apiFetch<ApiFixture[]>(`/fixtures?id=${fixtureId}`)
  return data[0] ?? null
}

/** Devuelve todos los fixtures de una competición + temporada */
export async function getAllFixtures(leagueId: number, season: number): Promise<ApiFixture[]> {
  return apiFetch<ApiFixture[]>(`/fixtures?league=${leagueId}&season=${season}`)
}

/** Devuelve todos los fixtures de una competición que están en curso ahora mismo */
export async function getLiveFixtures(leagueId: number): Promise<ApiFixture[]> {
  return apiFetch<ApiFixture[]>(`/fixtures?live=all&league=${leagueId}`)
}

/** Máximos goleadores */
export async function getTopScorers(leagueId: number, season: number): Promise<ApiPlayerStats[]> {
  return apiFetch<ApiPlayerStats[]>(`/players/topscorers?league=${leagueId}&season=${season}`)
}

/** Máximos asistentes */
export async function getTopAssists(leagueId: number, season: number): Promise<ApiPlayerStats[]> {
  return apiFetch<ApiPlayerStats[]>(`/players/topassists?league=${leagueId}&season=${season}`)
}
