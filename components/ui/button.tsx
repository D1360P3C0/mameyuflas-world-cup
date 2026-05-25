'use client'

/**
 * Componente Button — MWC Ultra-Strike Design System
 *
 * Variantes:
 *   primary   → pink gradient — CTA principal
 *   secondary → purple sólido — acciones secundarias
 *   outline   → borde pink — alternativa
 *   ghost     → transparente — acciones en superficies oscuras
 *   cyan      → cyan neon — live, destacados
 *   destructive → rojo
 *   link      → solo texto con underline
 *   nav-ghost → para navbar/sidebar
 *
 * Uso:
 *   <Button>Predecir ahora</Button>
 *   <Button variant="secondary" size="sm">Cancelar</Button>
 *   <Button variant="cyan">En vivo</Button>
 *   <Button isLoading>Guardando...</Button>
 */
import { forwardRef } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils/cn'

const buttonVariants = cva(
  [
    'inline-flex items-center justify-center gap-2 rounded-xl',
    'font-heading font-bold uppercase tracking-wide',
    'transition-all duration-200 cursor-pointer',
    'focus-visible:outline-none focus-visible:ring-2',
    'focus-visible:ring-[#FF5E9F] focus-visible:ring-offset-2',
    'focus-visible:ring-offset-[#0F0F1E]',
    'disabled:pointer-events-none disabled:opacity-40',
    'select-none',
  ],
  {
    variants: {
      variant: {
        // Pink gradient — CTA principal
        primary: [
          'bg-[#FF5E9F] text-white',
          'hover:bg-[#e0447f]',
          'hover:shadow-[0_0_20px_rgba(255,94,159,0.4)]',
          'active:scale-[0.97]',
        ],
        // Purple sólido — acciones secundarias
        secondary: [
          'bg-[#8B5CF6] text-white',
          'hover:bg-[#7c3aed]',
          'hover:shadow-[0_0_20px_rgba(139,92,246,0.4)]',
          'active:scale-[0.97]',
        ],
        // Borde pink sobre fondo oscuro
        outline: [
          'border border-[#FF5E9F]/50 bg-transparent text-[#FF5E9F]',
          'hover:bg-[#FF5E9F]/10 hover:border-[#FF5E9F]',
          'active:scale-[0.97]',
        ],
        // Transparente — para superficies oscuras
        ghost: [
          'text-white/70 bg-transparent',
          'hover:bg-white/8 hover:text-white',
        ],
        // Cyan neon — live, datos en tiempo real
        cyan: [
          'bg-transparent border border-[#00F5FF]/40 text-[#00F5FF]',
          'hover:bg-[#00F5FF]/10 hover:border-[#00F5FF]',
          'hover:shadow-[0_0_16px_rgba(0,245,255,0.3)]',
          'active:scale-[0.97]',
        ],
        // Rojo destructivo
        destructive: [
          'bg-[#ef4444] text-white',
          'hover:bg-red-600',
          'active:scale-[0.97]',
        ],
        // Solo texto / link
        link: [
          'text-[#FF5E9F] underline-offset-4 p-0 h-auto font-medium normal-case tracking-normal',
          'hover:underline',
        ],
        // Para navbar / sidebar
        'nav-ghost': [
          'text-white/50 rounded-lg',
          'hover:text-white hover:bg-white/6',
        ],
      },
      size: {
        sm:   'h-8  px-3 text-xs',
        md:   'h-10 px-4 text-sm',
        lg:   'h-11 px-6 text-base',
        xl:   'h-13 px-8 text-base',
        icon: 'h-9 w-9 p-0',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, isLoading, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        disabled={disabled ?? isLoading}
        aria-busy={isLoading}
        {...props}
      >
        {isLoading && (
          <svg
            className="h-4 w-4 animate-spin"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12" cy="12" r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        )}
        {children}
      </button>
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
