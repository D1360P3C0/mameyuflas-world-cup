'use client'

/**
 * AvatarUpload — componente cliente para subir foto de perfil.
 * Muestra avatar con overlay de cámara al hacer hover.
 * Usa uploadAvatarAction (Server Action) para subir a Supabase Storage.
 */
import { useRef, useState, useTransition } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils/cn'
import { uploadAvatarAction } from '@/features/auth/actions/auth.actions'

interface AvatarUploadProps {
  currentSrc?: string | null
  initials:    string
  displayName: string
}

export function AvatarUpload({ currentSrc, initials, displayName }: AvatarUploadProps) {
  const router   = useRouter()
  const fileRef  = useRef<HTMLInputElement>(null)
  const [preview, setPreview]   = useState<string | null>(currentSrc ?? null)
  const [error,   setError]     = useState<string | null>(null)
  const [success, setSuccess]   = useState(false)
  const [isPending, startTransition] = useTransition()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Vista previa local inmediata
    const localUrl = URL.createObjectURL(file)
    setPreview(localUrl)
    setError(null)
    setSuccess(false)

    const fd = new FormData()
    fd.append('avatar', file)

    startTransition(async () => {
      const result = await uploadAvatarAction(fd)
      if ('error' in result) {
        setError(result.error)
        setPreview(currentSrc ?? null)
      } else if (result.avatarUrl) {
        setPreview(result.avatarUrl)
        setSuccess(true)
        router.refresh()
      }
    })
  }

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Avatar con overlay de cámara */}
      <div className="relative group">
        <div
          className={cn(
            'relative h-20 w-20 rounded-full overflow-hidden',
            'ring-2 ring-white/10',
          )}
        >
          {preview ? (
            <Image
              src={preview}
              alt={displayName}
              fill
              className="object-cover"
              sizes="80px"
              unoptimized  /* para URLs de Supabase Storage con cache-bust */
            />
          ) : (
            <div
              className="h-full w-full flex items-center justify-center font-heading font-bold text-xl uppercase text-white"
              style={{ background: 'linear-gradient(135deg, #FF5E9F, #8B5CF6)' }}
            >
              {initials}
            </div>
          )}

          {/* Overlay de cámara */}
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={isPending}
            aria-label="Cambiar foto de perfil"
            className={cn(
              'absolute inset-0 flex items-center justify-center',
              'bg-black/60 transition-opacity',
              isPending
                ? 'opacity-100'
                : 'opacity-0 group-hover:opacity-100',
            )}
          >
            <span className="material-symbols-outlined text-white text-[28px]">
              {isPending ? 'hourglass_empty' : 'photo_camera'}
            </span>
          </button>
        </div>

        {/* Input oculto */}
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      {/* Botón de texto alternativo (accesible en mobile) */}
      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        disabled={isPending}
        className="font-mono text-[11px] text-[#00dce5] hover:text-[#33f7ff] transition-colors disabled:opacity-50"
      >
        {isPending ? 'Subiendo...' : 'Cambiar foto'}
      </button>

      {/* Feedback */}
      {error && (
        <p className="text-[11px] font-mono text-[#f87171] text-center max-w-[200px]">
          {error}
        </p>
      )}
      {success && !error && (
        <p className="text-[11px] font-mono text-[#4ade80]">
          ✓ Foto actualizada
        </p>
      )}
    </div>
  )
}
