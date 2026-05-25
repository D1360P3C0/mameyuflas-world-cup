'use client'

import { useState } from 'react'
import Image from 'next/image'
import { getFlagImageUrl } from '@/lib/utils/flags'
import { cn } from '@/lib/utils/cn'

interface FlagProps {
  countryCode?: string | null
  alt: string
  className?: string
  imageClassName?: string
  fallbackClassName?: string
  size?: number
  sourceWidth?: 20 | 40 | 80 | 160
}

export function Flag({
  countryCode,
  alt,
  className,
  imageClassName,
  fallbackClassName,
  size = 24,
  sourceWidth = 40,
}: FlagProps) {
  const [hasError, setHasError] = useState(false)
  const src = hasError ? null : getFlagImageUrl(countryCode, sourceWidth)

  if (!src) {
    return (
      <span
        className={cn(
          'inline-flex items-center justify-center overflow-hidden bg-white/10 text-[10px] font-bold uppercase text-white/70',
          fallbackClassName,
          className
        )}
        style={{ width: size, height: size }}
        aria-label={alt}
        title={alt}
      >
        {(countryCode ?? '?').slice(0, 2)}
      </span>
    )
  }

  return (
    <span
      className={cn('relative inline-flex overflow-hidden', className)}
      style={{ width: size, height: size }}
      title={alt}
    >
      <Image
        src={src}
        alt={alt}
        fill
        sizes={`${size}px`}
        className={cn('object-cover', imageClassName)}
        onError={() => setHasError(true)}
      />
    </span>
  )
}
