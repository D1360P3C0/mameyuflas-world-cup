'use client'

/**
 * Formulario de edición de perfil.
 * Tema claro: inputs blancos con bordes sutiles.
 * Permite al usuario actualizar su display_name, bio, país y equipo favorito.
 */
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { updateProfileAction } from '@/features/auth/actions/auth.actions'
import type { Profile } from '@/types/app.types'

interface EditProfileFormProps {
  profile: Profile
  onCancel?: () => void
}

type FormData = {
  display_name:  string
  bio:           string
  country_code:  string
  favorite_team: string
}

export function EditProfileForm({ profile, onCancel }: EditProfileFormProps) {
  const router = useRouter()
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<FormData>({
    defaultValues: {
      display_name:  profile.display_name,
      bio:           profile.bio ?? '',
      country_code:  profile.country_code ?? '',
      favorite_team: profile.favorite_team ?? '',
    },
  })

  const onSubmit = handleSubmit(async (data) => {
    setServerError(null)
    const result = await updateProfileAction(data)
    if ('error' in result) {
      setServerError(result.error)
    } else {
      router.refresh()
      onCancel?.()
    }
  })

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      {serverError && (
        <div
          role="alert"
          className="rounded-xl border border-[#f87171]/30 bg-[#f87171]/8 px-3 py-2.5 text-sm text-[#f87171]"
        >
          {serverError}
        </div>
      )}

      <Input
        label="Nombre para mostrar"
        type="text"
        placeholder="Tu nombre"
        error={errors.display_name?.message}
        {...register('display_name', {
          required: 'El nombre es obligatorio',
          minLength: { value: 2, message: 'Mínimo 2 caracteres' },
          maxLength: { value: 50, message: 'Máximo 50 caracteres' },
        })}
      />

      {/* Bio — textarea manual */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold uppercase tracking-wider text-white/60">
          Bio
        </label>
        <textarea
          placeholder="Cuéntanos algo sobre ti..."
          rows={3}
          className="w-full rounded-xl border border-white/10 bg-white/6 px-4 py-2.5 text-sm text-white placeholder:text-white/30 transition-all focus:border-[#FF5E9F]/60 focus:outline-none focus:ring-2 focus:ring-[#FF5E9F]/20 focus:bg-white/8 resize-none"
          {...register('bio', { maxLength: { value: 200, message: 'Máximo 200 caracteres' } })}
        />
        {errors.bio && (
          <p className="text-xs text-[#f87171]">{errors.bio.message}</p>
        )}
      </div>

      <Input
        label="Código de país (ej. ES, MX, AR)"
        type="text"
        placeholder="ES"
        maxLength={2}
        {...register('country_code', {
          pattern: { value: /^[A-Z]{0,2}$/, message: 'Código de 2 letras mayúsculas' },
          setValueAs: (v: string) => v.toUpperCase(),
        })}
      />

      <Input
        label="Equipo favorito"
        type="text"
        placeholder="España, México, Argentina..."
        {...register('favorite_team', {
          maxLength: { value: 50, message: 'Máximo 50 caracteres' },
        })}
      />

      <div className="flex gap-3 pt-2">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
        )}
        <Button
          type="submit"
          isLoading={isSubmitting}
          disabled={!isDirty}
          className="flex-1"
        >
          Guardar cambios
        </Button>
      </div>
    </form>
  )
}
