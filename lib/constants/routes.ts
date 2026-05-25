/**
 * Rutas tipadas de la aplicación MWC.
 * Usar siempre estas constantes en lugar de strings hardcodeados.
 *
 * Uso: import { ROUTES } from '@/lib/constants/routes'
 *      router.push(ROUTES.DASHBOARD)
 *      <Link href={ROUTES.MATCH(matchId)}>
 */

export const ROUTES = {
  // Públicas
  HOME: '/',

  // Auth (route group: (auth))
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',

  // App principal (route group: (main))
  DASHBOARD:   '/dashboard',
  PREDICTIONS: '/predictions',
  SPECIALS:    '/specials',
  MY_ELEVEN:   '/my-eleven',
  FANZONE:     '/fanzone',
  SPAIN_XI:    '/spain-xi',
  MATCHES:     '/matches',
  MATCH:       (matchId: string) => `/matches/${matchId}`,
  LEADERBOARD: '/leaderboard',
  LEAGUES:     '/leagues',
  LEAGUE:      (leagueId: string) => `/leagues/${leagueId}`,
  PROFILE:     '/profile',
  USER_PROFILE: (userId: string) => `/profile/${userId}`,
  NEWS:        '/news',

  // Admin (route group: (admin))
  ADMIN: '/admin/dashboard',
  ADMIN_MATCHES: '/admin/matches',
  ADMIN_USERS: '/admin/users',

  // API
  AUTH_CALLBACK: '/api/auth/callback',
} as const
