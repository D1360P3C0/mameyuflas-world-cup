'use client'

/**
 * BottomNav — 4 ítems: Inicio · Predicciones · XI España · Ranking
 * Material Symbols Outlined, rounded-t-xl, purple shadow neon.
 */
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils/cn'
import { ROUTES } from '@/lib/constants/routes'

const navItems = [
  {
    label: 'Inicio',
    href:  ROUTES.DASHBOARD,
    icon:  'home',
    activeRoutes: [ROUTES.DASHBOARD],
  },
  {
    label: 'Predicciones',
    href:  ROUTES.PREDICTIONS,
    icon:  'sports_soccer',
    activeRoutes: [ROUTES.PREDICTIONS, ROUTES.SPECIALS],
  },
  {
    label: 'XI España',
    href:  ROUTES.SPAIN_XI,
    icon:  'flag',
    activeRoutes: [ROUTES.SPAIN_XI],
  },
  {
    label: 'Ranking',
    href:  ROUTES.LEADERBOARD,
    icon:  'leaderboard',
    activeRoutes: [ROUTES.LEADERBOARD],
  },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-20 items-center justify-around rounded-t-xl border-t border-white/10 bg-[#1E1E2E]/90 px-4 backdrop-blur-lg shadow-[0px_-10px_40px_rgba(87,27,193,0.3)]">
      {navItems.map((item) => {
        const isActive = item.activeRoutes.some(
          route => pathname === route || pathname.startsWith(route + '/')
        )

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isActive ? 'page' : undefined}
            className={cn(
              'flex flex-col items-center justify-center gap-1 rounded-lg p-2 transition-all duration-150',
              isActive
                ? 'text-[#ffb0c9] drop-shadow-[0_0_8px_rgba(255,176,201,0.6)]'
                : 'text-white/60 hover:bg-[#383848]/50',
            )}
          >
            <span
              className="material-symbols-outlined text-[24px]"
              style={isActive ? { fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" } : undefined}
            >
              {item.icon}
            </span>
            <span className="font-mono text-[12px] font-semibold leading-none tracking-wide">
              {item.label}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}
