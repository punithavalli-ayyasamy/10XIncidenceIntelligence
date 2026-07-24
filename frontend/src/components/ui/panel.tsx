import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/utils'

export function Panel({
  className,
  children,
  glow = 'none',
  ...props
}: HTMLAttributes<HTMLDivElement> & {
  children: ReactNode
  glow?: 'blue' | 'orange' | 'red' | 'green' | 'none'
}) {
  const glowClass =
    glow === 'blue'
      ? 'shadow-[var(--shadow-glow-blue)]'
      : glow === 'orange'
        ? 'shadow-[var(--shadow-glow-orange)]'
        : glow === 'red'
          ? 'shadow-[var(--shadow-glow-red)]'
          : glow === 'green'
            ? 'shadow-[0_0_40px_rgba(45,212,168,0.22)] ring-1 ring-ok/35'
            : ''

  return (
    <div className={cn('glass relative overflow-hidden rounded-2xl', glowClass, className)} {...props}>
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-signal/40 to-transparent" />
      {children}
    </div>
  )
}
