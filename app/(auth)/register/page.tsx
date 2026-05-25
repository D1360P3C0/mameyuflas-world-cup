/**
 * Página de Registro — Ultra-Strike Design.
 * Card oscura glassmorphism sobre fondo con glows.
 */
import type { Metadata } from 'next'
import Link from 'next/link'
import { RegisterForm } from '@/features/auth/components/RegisterForm'
import { ROUTES } from '@/lib/constants/routes'

export const metadata: Metadata = { title: 'Crear cuenta' }

export default function RegisterPage() {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#1A1A2E]/90 p-6 shadow-[0_8px_40px_rgba(0,0,0,0.6)] backdrop-blur-sm">
      <h1 className="mb-6 text-center font-heading text-2xl font-bold uppercase tracking-wide text-white">
        Crear cuenta
      </h1>

      {/* Formulario */}
      <RegisterForm />

      {/* Links */}
      <p className="mt-6 text-center text-sm text-white/40">
        ¿Ya tienes cuenta?{' '}
        <Link
          href={ROUTES.LOGIN}
          className="font-semibold text-[#FF5E9F] hover:underline"
        >
          Iniciar sesión
        </Link>
      </p>
    </div>
  )
}
