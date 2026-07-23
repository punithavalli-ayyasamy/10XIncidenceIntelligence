import type { HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export function Badge({
  className,
  tone = 'signal',
  ...props
}: HTMLAttributes<HTMLSpanElement> & {
  tone?: 'signal' | 'alert' | 'critical' | 'ok' | 'muted'
}) {
  const tones = {
    signal: 'border-signal/40 bg-signal/15 text-signal',
    alert: 'border-alert/40 bg-alert/15 text-alert',
    critical: 'border-critical/50 bg-critical/15 text-critical',
    ok: 'border-ok/40 bg-ok/15 text-ok',
    muted: 'border-line bg-panel-2 text-muted',
  }
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-sm border px-2 py-0.5 font-mono text-[11px] font-semibold uppercase tracking-[0.14em]',
        tones[tone],
        className,
      )}
      {...props}
    />
  )
}
