/**
 * Helpers de formateo de strings y números para MWC.
 */

/** Formatea un marcador: "2 – 1" */
export function formatScore(home: number | null, away: number | null): string {
  if (home === null || away === null) return '– : –'
  return `${home} – ${away}`
}

/** Formatea puntos con signo: "+3", "-1", "0" */
export function formatPoints(points: number): string {
  if (points > 0) return `+${points}`
  return String(points)
}

/** Abrevia nombre largo: "España" → "ESP", o usa el código si está disponible */
export function abbreviateTeam(name: string, code?: string): string {
  if (code) return code.toUpperCase()
  return name.slice(0, 3).toUpperCase()
}

/** Formatea posición de ranking: "1º", "2º", "3º", "4ª"... */
export function formatRank(rank: number): string {
  return `${rank}º`
}

/** Trunca texto con ellipsis */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return `${text.slice(0, maxLength)}…`
}

/** Genera iniciales de un nombre: "Diego Pérez" → "DP" */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase() ?? '')
    .join('')
}
