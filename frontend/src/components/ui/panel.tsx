import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/utils'

export function Panel({
  className,
  children,
  glow = 'blue',
  ...props
}: HTMLAttributes<HTMLDivElement> & {
  children: ReactNode
  glow?: 'blue' | 'orange' | 'red' | 'none'
}) {
  const glowClass =
    glow === 'blue'
      ? 'shadow-[var(--shadow-glow-blue)]'
      : glow === 'orange'
        ? 'shadow-[var(--shadow-glow-orange)]'
        : glow === 'red'
          ? 'shadow-[var(--shadow-glow-red)]'
          : ''

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-xl border border-line bg-panel/80 backdrop-blur-md',
        glowClass,
        className,
      )}
      {...props}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-signal/50 to-transparent" />
      {children}
    </div>
  )
}
