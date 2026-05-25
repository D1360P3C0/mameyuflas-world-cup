/**
 * Página de Login — Ultra-Strike Design.
 * Card oscura glassmorphism con borde sutil y accents pink.
 */
import type { Metadata } from 'next'
import Link from 'next/link'
import { Suspense } from 'react'
import { LoginForm } from '@/features/auth/components/LoginForm'
import { GoogleAuthButton } from '@/features/auth/components/GoogleAuthButton'
import { ROUTES } from '@/lib/constants/routes'

export const metadata: Metadata = { title: 'Iniciar sesión' }

export default function LoginPage() {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#1A1A2E]/90 p-6 shadow-[0_8px_40px_rgba(0,0,0,0.6)] backdrop-blur-sm">
      <h1 className="mb-6 text-center font-heading text-2xl font-bold uppercase tracking-wide text-white">
        Iniciar sesión
      </h1>

      {/* Google OAuth */}
      <GoogleAuthButton label="Continuar con Google" />

      {/* Divider */}
      <div className="my-5 flex items-center gap-3">
        <div className="h-px flex-1 bg-white/10" />
        <span className="text-xs text-white/30 uppercase tracking-wider">o</span>
        <div className="h-px flex-1 bg-white/10" />
      </div>

      {/* Formulario email/password */}
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>

      {/* Links */}
      <p className="mt-6 text-center text-sm text-white/40">
        ¿Aún no tienes cuenta?{' '}
        <Link
          href={ROUTES.REGISTER}
          className="font-semibold text-[#FF5E9F] hover:underline"
        >
          Regístrate gratis
        </Link>
      </p>
    </div>
  )
}
