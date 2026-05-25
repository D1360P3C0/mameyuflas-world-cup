'use client'

/**
 * Componente Input — MWC Ultra-Strike Design System
 * Input oscuro con borde sutil y focus neon pink.
 *
 * Uso:
 *   <Input label="Email" type="email" placeholder="tu@email.com" />
 *   <Input label="Email" error={errors.email?.message} {...register('email')} />
 */
import { forwardRef, useId } from 'react'
import { cn } from '@/lib/utils/cn'

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, id, ...props }, ref) => {
    const generatedId = useId()
    const inputId = id ?? generatedId

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-xs font-semibold uppercase tracking-wider text-white/60"
          >
            {label}
          </label>
        )}

        <input
          id={inputId}
          ref={ref}
          className={cn(
            // Base
            'h-11 w-full rounded-xl px-4 text-sm text-white',
            'bg-white/6 border border-white/10',
            'placeholder:text-white/30',
            'transition-all duration-150',
            // Focus
            'focus:outline-none focus:border-[#FF5E9F]/60',
            'focus:ring-2 focus:ring-[#FF5E9F]/20',
            'focus:bg-white/8',
            // Error
            error && [
              'border-[#f87171]/60',
              'focus:border-[#f87171]/80',
              'focus:ring-[#f87171]/20',
            ],
            className
          )}
          aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
          aria-invalid={error ? true : undefined}
          {...props}
        />

        {error && (
          <p id={`${inputId}-error`} className="text-xs text-[#f87171]" role="alert">
            {error}
          </p>
        )}
        {hint && !error && (
          <p id={`${inputId}-hint`} className="text-xs text-white/40">
            {hint}
          </p>
        )}
      </div>
    )
  }
)
Input.displayName = 'Input'

export { Input }
