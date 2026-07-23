import { motion } from 'framer-motion'
import { Wrench } from 'lucide-react'
import { mockReport } from '@/data/mockReport'
import { SectionHeader } from '@/components/shared/SectionHeader'
import { Panel } from '@/components/ui/panel'

export function SelfHealingSection() {
  return (
    <section id="healing" className="mx-auto max-w-7xl px-4 py-14 md:px-6">
      <SectionHeader
        index={10}
        title="Self-Healing Execution Timeline"
        subtitle="Ten autonomous actions from acknowledge to restore — closed in under five minutes."
      />
      <Panel className="p-6" glow="orange">
        <div className="mb-6 flex items-center gap-2 text-alert">
          <Wrench className="h-5 w-5" />
          <span className="font-mono text-xs uppercase tracking-[0.2em]">
            SelfHealExecutor · Playbook BF-10
          </span>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {mockReport.healingTimeline.map((step, i) => (
            <motion.div
              key={step.step}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="rounded-lg border border-line bg-void/50 p-4"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="font-display text-2xl text-alert">
                  {String(step.step).padStart(2, '0')}
                </span>
                <span className="font-mono text-xs text-ok">{step.t} · {step.status}</span>
              </div>
              <p className="mt-2 text-ink">{step.title}</p>
            </motion.div>
          ))}
        </div>
      </Panel>
    </section>
  )
}
