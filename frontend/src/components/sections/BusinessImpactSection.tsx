import { motion } from 'framer-motion'
import { mockReport } from '@/data/mockReport'
import { SectionHeader } from '@/components/shared/SectionHeader'
import { Panel } from '@/components/ui/panel'

const toneText = {
  critical: 'text-critical',
  alert: 'text-alert',
  signal: 'text-signal',
} as const

export function BusinessImpactSection() {
  return (
    <section id="impact" className="mx-auto max-w-7xl px-4 py-14 md:px-6">
      <SectionHeader
        index={5}
        title="Top 10 Business Impact Indicators"
        subtitle="What the outage meant for revenue, shoppers, and brand — in ten numbers."
      />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {mockReport.businessImpact.map((item, i) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.03 }}
          >
            <Panel className="h-full p-4" glow={item.tone === 'critical' ? 'red' : 'orange'}>
              <p className="font-mono text-[10px] uppercase tracking-widest text-muted">
                KPI {String(item.id).padStart(2, '0')}
              </p>
              <p
                className={`mt-2 font-display text-3xl ${toneText[item.tone as keyof typeof toneText] ?? 'text-signal'}`}
              >
                {item.value}
              </p>
              <p className="mt-1 text-sm text-ink-dim">{item.label}</p>
            </Panel>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
