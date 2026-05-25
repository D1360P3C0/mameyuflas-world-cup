/**
 * Componente Avatar — MWC Ultra-Strike Design System
 * Muestra foto de perfil o iniciales como fallback.
 * Fallback gradient pink→purple.
 *
 * Uso:
 *   <Avatar src={profile.avatar_url} alt={profile.display_name} size="md" />
 *   <Avatar initials="DG" size="lg" />
 */
import Image from 'next/image'
import { cn } from '@/lib/utils/cn'

interface AvatarProps {
  src?: string | null
  alt?: string
  /** Iniciales como fallback cuando no hay imagen */
  initials?: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const sizeMap = {
  xs: { container: 'h-6 w-6',   text: 'text-[10px]' },
  sm: { container: 'h-8 w-8',   text: 'text-xs' },
  md: { container: 'h-10 w-10', text: 'text-sm' },
  lg: { container: 'h-14 w-14', text: 'text-base' },
  xl: { container: 'h-20 w-20', text: 'text-xl' },
}

export function Avatar({
  src,
  alt = '',
  initials,
  size = 'md',
  className,
}: AvatarProps) {
  const { container, text } = sizeMap[size]

  if (src) {
    return (
      <div
        className={cn(
          'relative overflow-hidden rounded-full ring-2 ring-white/10',
          container,
          className
        )}
      >
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover"
          sizes="80px"
        />
      </div>
    )
  }

  return (
    <div
      className={cn(
        'flex items-center justify-center rounded-full',
        'ring-2 ring-white/10',
        'font-heading font-bold uppercase text-white',
        container,
        text,
        className
      )}
      style={{ background: 'linear-gradient(135deg, #FF5E9F, #8B5CF6)' }}
      aria-label={alt || initials}
    >
      {initials ?? '?'}
    </div>
  )
}

/** Obtiene las iniciales de un nombre completo */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}
