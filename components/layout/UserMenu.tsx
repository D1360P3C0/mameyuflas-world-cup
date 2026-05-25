'use client'

/**
 * Menú de usuario en la Navbar — Ultra-Strike Design.
 * Dropdown oscuro (#1A1A2E) con bordes sutiles.
 * Client Component — necesita estado para el dropdown.
 */
import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { Avatar, getInitials } from '@/components/ui/avatar'
import { logoutAction } from '@/features/auth/actions/auth.actions'
import { ROUTES } from '@/lib/constants/routes'

interface UserMenuProps {
  displayName: string
  username:    string
  avatarUrl?:  string | null
}

export function UserMenu({ displayName, username, avatarUrl }: UserMenuProps) {
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) {
      document.addEventListener('mousedown', onClickOutside)
    }
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [open])

  return (
    <div ref={menuRef} className="relative">
      {/* Trigger */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-xl px-2 py-1.5 transition-all hover:bg-white/6"
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <Avatar
          src={avatarUrl}
          alt={displayName}
          initials={getInitials(displayName)}
          size="sm"
        />
        <span className="hidden text-sm font-medium text-white/70 md:block">
          {displayName}
        </span>
        {/* Chevron */}
        <svg
          className={`h-3.5 w-3.5 text-white/40 transition-transform hidden md:block ${open ? 'rotate-180' : ''}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2.5}
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown oscuro */}
      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-50 mt-2 w-52 overflow-hidden rounded-2xl border border-white/10 bg-[#1A1A2E] shadow-[0_8px_32px_rgba(0,0,0,0.5)]"
        >
          {/* Header con usuario */}
          <div className="border-b border-white/8 px-4 py-3">
            <p className="text-sm font-semibold text-white">{displayName}</p>
            <p className="text-xs text-white/40">@{username}</p>
          </div>

          {/* Opciones */}
          <div className="p-1.5">
            <Link
              href={ROUTES.PROFILE}
              role="menuitem"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-white/60 transition-colors hover:bg-white/6 hover:text-white"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              </svg>
              Mi perfil
            </Link>
          </div>

          {/* Logout */}
          <div className="border-t border-white/8 p-1.5">
            <form action={logoutAction}>
              <button
                type="submit"
                role="menuitem"
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-white/40 transition-colors hover:bg-[#f87171]/10 hover:text-[#f87171]"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                </svg>
                Cerrar sesión
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
