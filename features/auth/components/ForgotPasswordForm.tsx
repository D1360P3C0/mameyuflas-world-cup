'use client'

/**
 * Formulario de recuperación de contraseña.
 * Tema claro: inputs blancos con acento azul.
 * Envía un email con link de reset a través de Supabase Auth.
 */
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  forgotPasswordSchema,
  type ForgotPasswordInput,
} from '@/lib/validations/auth.schemas'
import { forgotPasswordAction } from '@/features/auth/actions/auth.actions'

export function ForgotPasswordForm() {
  const [sent, setSent] = useState(false)

  const {
    register,
    handleSubmit,
    setError,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
  })

  const onSubmit = handleSubmit(async (data) => {
    const result = await forgotPasswordAction(data)
    if ('error' in result) {
      setError('root', { message: result.error })
    } else {
      setSent(true)
    }
  })

  if (sent) {
    return (
      <div className="flex flex-col items-center gap-4 py-2 text-center">
        {/* Icono de email enviado */}
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#FF5E9F]/12 ring-2 ring-[#FF5E9F]/20">
          <svg className="h-7 w-7 text-[#FF5E9F]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        </div>
        <div>
          <p className="font-heading font-bold uppercase text-white">
            Email enviado
          </p>
          <p className="mt-1 text-sm text-white/60">
            Hemos enviado un enlace de recuperación a{' '}
            <span className="font-semibold text-[#FF5E9F]">{getValues('email')}</span>.
            Revisa tu bandeja de entrada.
          </p>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
      {errors.root && (
        <div
          role="alert"
          className="rounded-xl border border-[#f87171]/30 bg-[#f87171]/8 px-3 py-2.5 text-sm text-[#f87171]"
        >
          {errors.root.message}
        </div>
      )}

      <p className="text-sm text-white/60">
        Introduce tu email y te enviaremos un enlace para restablecer tu contraseña.
      </p>

      <Input
        label="Email"
        type="email"
        autoComplete="email"
        placeholder="tu@email.com"
        error={errors.email?.message}
        {...register('email')}
      />

      <Button
        type="submit"
        isLoading={isSubmitting}
        className="w-full mt-1"
      >
        Enviar enlace
      </Button>
    </form>
  )
}
