// API-Football v3 — Constantes para el Mundial 2026

export const WC2026_LEAGUE_ID = 1
export const WC2026_SEASON = 2026

// Fixture status codes (short form)
export const STATUS_NOT_STARTED = ['NS', 'TBD']
export const STATUS_LIVE = ['1H', 'HT', '2H', 'ET', 'BT', 'P', 'INT']
export const STATUS_HALFTIME = ['HT']
export const STATUS_FULLTIME = ['FT', 'AET', 'PEN']
export const STATUS_POSTPONED = ['PST', 'CANC', 'ABD', 'AWD', 'WO']

// Mapeo FIFA code → nombre en inglés como aparece en API-Football
// Actualizar si la API devuelve nombres distintos
export const FIFA_TO_API_NAME: Record<string, string> = {
  // Grupo A
  MEX: 'Mexico',
  RSA: 'South Africa',
  KOR: 'South Korea',
  CZE: 'Czech Republic',
  // Grupo B
  CAN: 'Canada',
  BIH: 'Bosnia and Herzegovina',
  QAT: 'Qatar',
  SUI: 'Switzerland',
  // Grupo C
  BRA: 'Brazil',
  MAR: 'Morocco',
  HAI: 'Haiti',
  SCO: 'Scotland',
  // Grupo D
  USA: 'USA',
  PAR: 'Paraguay',
  AUS: 'Australia',
  TUR: 'Turkey',
  // Grupo E
  GER: 'Germany',
  CUW: 'Curaçao',
  CIV: "Ivory Coast",
  ECU: 'Ecuador',
  // Grupo F
  NED: 'Netherlands',
  JPN: 'Japan',
  SWE: 'Sweden',
  TUN: 'Tunisia',
  // Grupo G
  BEL: 'Belgium',
  EGY: 'Egypt',
  IRN: 'Iran',
  NZL: 'New Zealand',
  // Grupo H
  ESP: 'Spain',
  CPV: 'Cape Verde',
  KSA: 'Saudi Arabia',
  URU: 'Uruguay',
  // Grupo I
  FRA: 'France',
  SEN: 'Senegal',
  IRQ: 'Iraq',
  NOR: 'Norway',
  // Grupo J
  ARG: 'Argentina',
  ALG: 'Algeria',
  AUT: 'Austria',
  JOR: 'Jordan',
  // Grupo K
  POR: 'Portugal',
  COD: 'DR Congo',
  UZB: 'Uzbekistan',
  COL: 'Colombia',
  // Grupo L
  ENG: 'England',
  CRO: 'Croatia',
  GHA: 'Ghana',
  PAN: 'Panama',
}
