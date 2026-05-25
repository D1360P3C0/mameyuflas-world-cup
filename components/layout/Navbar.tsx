/**
 * TopAppBar - Ultra-Strike / Stitch design.
 *
 * Mobile:  [menu icon]  [WORLD CUP 2026 italic pink]  [bell + avatar]
 * Desktop: [WORLD CUP 2026 italic pink]  [bell + avatar]
 *
 * Server Component - interactividad delegada a UserMenu (Client).
 */
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { UserMenu } from './UserMenu'
import { ROUTES } from '@/lib/constants/routes'
import { getInitials } from '@/components/ui/avatar'

export async function Navbar() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let profile = null
  if (user) {
    const { data } = await supabase
      .from('profiles')
      .select('username, display_name, avatar_url')
      .eq('id', user.id)
      .single()
    profile = data
  }

  const initials = profile?.display_name ? getInitials(profile.display_name) : '?'

  return (
    <header className="sticky top-0 z-50 flex h-16 w-full items-center justify-between border-b border-white/10 bg-[#121221]/80 px-4 shadow-[0px_4px_20px_rgba(255,94,159,0.15)] backdrop-blur-md">
      <div className="flex items-center gap-4">
        <button aria-label="Abrir menu" className="cursor-pointer text-[#ffb0c9] md:hidden">
          <span className="material-symbols-outlined">menu</span>
        </button>

        <Link href={ROUTES.DASHBOARD}>
          <h1 className="font-heading text-2xl font-semibold italic leading-none tracking-tighter text-[#ffb0c9]">
            WORLD CUP 2026
          </h1>
        </Link>
      </div>

      <div className="flex items-center gap-3">
        <button aria-label="Notificaciones" className="text-white/60 transition-colors hover:text-white">
          <span className="material-symbols-outlined">notifications</span>
        </button>

        {user && profile ? (
          <UserMenu
            displayName={profile.display_name}
            username={profile.username}
            avatarUrl={profile.avatar_url}
          />
        ) : (
          <Link
            href={ROUTES.LOGIN}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-[#ffb0c9]/30 text-[10px] font-black text-white/60 transition-all hover:border-[#ffb0c9]/60"
          >
            {initials}
          </Link>
        )}
      </div>
    </header>
  )
}
