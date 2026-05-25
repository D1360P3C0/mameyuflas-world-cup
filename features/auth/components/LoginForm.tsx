'use client'

/**
 * Formulario de Login.
 * React Hook Form + Zod + Server Action.
 *
 * Flujo:
 *  1. Usuario rellena email + password
 *  2. Zod valida en cliente antes de enviar
 *  3. loginAction ejecuta en servidor
 *  4. Si error → muestra mensaje
 *  5. Si éxito → router.push al dashboard (o redirectTo)
 */
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { loginSchema, type LoginInput } from '@/lib/validations/auth.schemas'
import { loginAction } from '@/features/auth/actions/auth.actions'
import { ROUTES } from '@/lib/constants/routes'

export function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirectTo') ?? ROUTES.DASHBOARD

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = handleSubmit(async (data) => {
    const result = await loginAction(data)
    if ('error' in result) {
      setError('root', { message: result.error })
    } else {
      router.push(redirectTo)
      router.refresh()
    }
  })

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
      {/* Error global (del servidor) */}
      {errors.root && (
        <div
          role="alert"
          className="rounded-xl border border-[#f87171]/30 bg-[#f87171]/8 px-3 py-2.5 text-sm text-[#f87171]"
        >
          {errors.root.message}
        </div>
      )}

      <Input
        label="Email"
        type="email"
        autoComplete="email"
        placeholder="tu@email.com"
        error={errors.email?.message}
        {...register('email')}
      />

      <div className="flex flex-col gap-1.5">
        <Input
          label="Contraseña"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          error={errors.password?.message}
          {...register('password')}
        />
        <div className="flex justify-end">
          <Link
            href={ROUTES.FORGOT_PASSWORD}
            className="text-xs text-white/40 transition-colors hover:text-[#FF5E9F]"
          >
            ¿Olvidaste tu contraseña?
          </Link>
        </div>
      </div>

      <Button
        type="submit"
        isLoading={isSubmitting}
        className="w-full mt-1"
      >
        Entrar
      </Button>
    </form>
  )
}
