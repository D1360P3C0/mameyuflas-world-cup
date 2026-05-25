/**
 * Página de Recuperación de Contraseña — Ultra-Strike Design.
 */
import type { Metadata } from 'next'
import Link from 'next/link'
import { ForgotPasswordForm } from '@/features/auth/components/ForgotPasswordForm'
import { ROUTES } from '@/lib/constants/routes'

export const metadata: Metadata = { title: 'Recuperar contraseña' }

export default function ForgotPasswordPage() {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#1A1A2E]/90 p-6 shadow-[0_8px_40px_rgba(0,0,0,0.6)] backdrop-blur-sm">
      <h1 className="mb-2 text-center font-heading text-2xl font-bold uppercase tracking-wide text-white">
        Recuperar contraseña
      </h1>

      <ForgotPasswordForm />

      <p className="mt-6 text-center text-sm text-white/40">
        <Link
          href={ROUTES.LOGIN}
          className="font-semibold text-[#FF5E9F] hover:underline"
        >
          ← Volver al login
        </Link>
      </p>
    </div>
  )
}
