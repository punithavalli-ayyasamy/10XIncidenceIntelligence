import { motion } from 'framer-motion'
import { mockReport } from '@/data/mockReport'
import { SectionHeader } from '@/components/shared/SectionHeader'
import { Panel } from '@/components/ui/panel'

export function InsightsSection() {
  return (
    <section id="insights" className="mx-auto max-w-7xl px-4 py-14 md:px-6">
      <SectionHeader
        index={1}
        title="Top 10 Incident Insights"
        subtitle="Ten narrative signals the AI extracted from the Black Friday payment failure."
      />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {mockReport.insights.map((item, i) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.04 }}
          >
            <Panel className="h-full p-4" glow={i % 3 === 0 ? 'red' : i % 3 === 1 ? 'orange' : 'blue'}>
              <p className="font-display text-3xl text-signal/80">{String(item.id).padStart(2, '0')}</p>
              <h3 className="mt-2 text-base font-semibold text-ink">{item.title}</h3>
              <p className="mt-1 text-sm text-ink-dim">{item.detail}</p>
            </Panel>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
