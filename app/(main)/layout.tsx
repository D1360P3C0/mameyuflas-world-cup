/**
 * Layout para el área principal de la app (autenticada).
 * Sin sidebar — navegación via TopAppBar + BottomNav, igual que Stitch.
 */
import type { Metadata } from 'next'
import { Navbar }    from '@/components/layout/Navbar'
import { BottomNav } from '@/components/layout/BottomNav'

export const metadata: Metadata = {
  title: {
    default:  'App',
    template: '%s | MWC',
  },
}

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-dvh flex-col bg-[#121221]">
      <Navbar />
      <main className="flex-1 overflow-x-hidden">
        {children}
      </main>
      <BottomNav />
    </div>
  )
}
