/**
 * Componentes Card — MWC Ultra-Strike Design System
 * Superficie oscura (#1A1A2E) con bordes sutiles y soporte para glow neon.
 *
 * Uso:
 *   <Card>...</Card>
 *   <Card glow="pink">...</Card>   ← glow neon de acento
 *   <Card highlight>...</Card>     ← borde izquierdo pink (live / activo)
 *
 *   <CardHeader>
 *     <CardTitle>Título</CardTitle>
 *   </CardHeader>
 *   <CardContent>Contenido</CardContent>
 */
import { cn } from '@/lib/utils/cn'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Resalta el card con borde izquierdo pink (p.ej. partido en vivo) */
  highlight?: boolean
  /** Efecto de glow neon en el borde */
  glow?: 'pink' | 'purple' | 'cyan'
}

const glowStyles = {
  pink:   'shadow-[0_0_20px_rgba(255,94,159,0.2)] border-[rgba(255,94,159,0.3)]',
  purple: 'shadow-[0_0_20px_rgba(139,92,246,0.2)] border-[rgba(139,92,246,0.3)]',
  cyan:   'shadow-[0_0_20px_rgba(0,245,255,0.2)] border-[rgba(0,245,255,0.3)]',
}

function Card({ className, highlight, glow, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-white/8 bg-[#1A1A2E]',
        'shadow-[0_4px_24px_rgba(0,0,0,0.4)]',
        'transition-all duration-200',
        highlight && 'border-l-2 border-l-[#FF5E9F]',
        glow && glowStyles[glow],
        className
      )}
      {...props}
    />
  )
}

function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('px-4 pt-4 pb-0 md:px-5 md:pt-5', className)}
      {...props}
    />
  )
}

function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn(
        'font-heading text-base font-bold uppercase tracking-wide text-white',
        className
      )}
      {...props}
    />
  )
}

function CardDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn('mt-1 text-sm text-white/60', className)}
      {...props}
    />
  )
}

function CardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('px-4 py-4 md:px-5 md:py-5', className)}
      {...props}
    />
  )
}

function CardFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'flex items-center px-4 pb-4 pt-0 md:px-5 md:pb-5',
        className
      )}
      {...props}
    />
  )
}

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter }
