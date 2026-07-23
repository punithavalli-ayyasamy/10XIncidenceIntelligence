import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

export function SectionHeader({
  index,
  title,
  subtitle,
  action,
}: {
  index: number
  title: string
  subtitle: string
  action?: ReactNode
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="font-display text-4xl font-bold text-signal text-glow-blue md:text-5xl"
          >
            {String(index).padStart(2, '0')}
          </motion.span>
          <div className="h-8 w-px bg-line-bright" />
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-alert">
            10X Command · Section {index}/10
          </p>
        </div>
        <h2 className="font-display text-2xl font-semibold tracking-wide text-ink md:text-3xl">
          {title}
        </h2>
        <p className="max-w-2xl text-base text-ink-dim md:text-lg">{subtitle}</p>
      </div>
      {action}
    </div>
  )
}
