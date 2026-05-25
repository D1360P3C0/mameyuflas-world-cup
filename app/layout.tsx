import type { Metadata } from 'next'
import { Sora, Manrope, JetBrains_Mono } from 'next/font/google'
import { Providers } from '@/components/layout/providers'
import './globals.css'

/* --------------------------------------------------
   Fuentes Ultra-Strike
   -------------------------------------------------- */
const sora = Sora({
  variable: '--font-sora',
  subsets: ['latin'],
  weight: ['400', '600', '700', '800'],
  display: 'swap',
})

const manrope = Manrope({
  variable: '--font-manrope',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  variable: '--font-jetbrains-mono',
  subsets: ['latin'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'Mameyuflas World Cup',
    template: '%s | MWC',
  },
  description:
    'La porra del Mundial 2026. Predicciones, ligas privadas, rankings y Match Center en tiempo real.',
  keywords: ['mundial 2026', 'porra futbol', 'predicciones', 'world cup'],
  openGraph: {
    title: 'Mameyuflas World Cup',
    description: 'La porra del Mundial 2026.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="es"
      className={`${sora.variable} ${manrope.variable} ${jetbrainsMono.variable} h-full bg-[#0F0F1E]`}
    >
      <head>
        {/* Material Symbols Outlined — required for Stitch icon system */}
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=block"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-dvh flex flex-col bg-[#0F0F1E] text-white">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
