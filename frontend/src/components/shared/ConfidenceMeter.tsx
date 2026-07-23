import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

export function ConfidenceMeter({
  value,
  label = 'Confidence',
  scale = 100,
}: {
  value: number
  label?: string
  scale?: 1 | 100
}) {
  const pct = scale === 1 ? value * 100 : value
  const tone = pct >= 90 ? 'bg-critical' : pct >= 75 ? 'bg-alert' : 'bg-signal'

  return (
    <div className="space-y-2">
      <div className="flex items-end justify-between gap-3">
        <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted">{label}</span>
        <span className="font-display text-xl text-ink text-glow-blue">{Math.round(pct)}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-panel-2 ring-1 ring-line">
        <motion.div
          className={cn('h-full rounded-full', tone)}
          initial={{ width: 0 }}
          whileInView={{ width: `${pct}%` }}
          viewport={{ once: true }}
          transition={{ duration: 1.1, ease: 'easeOut' }}
        />
      </div>
    </div>
  )
}
