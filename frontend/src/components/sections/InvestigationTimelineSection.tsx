import { motion } from 'framer-motion'
import { CheckCircle2 } from 'lucide-react'
import { mockReport } from '@/data/mockReport'
import { SectionHeader } from '@/components/shared/SectionHeader'
import { Panel } from '@/components/ui/panel'

export function InvestigationTimelineSection() {
  return (
    <section id="timeline" className="mx-auto max-w-7xl px-4 py-14 md:px-6">
      <SectionHeader
        index={2}
        title="10-Step Autonomous AI Investigation Timeline"
        subtitle="From metric ingest to self-heal — every hop is agent-owned and timestamped."
      />
      <Panel className="p-6" glow="blue">
        <ol className="relative space-y-0">
          <div className="absolute top-2 bottom-2 left-[15px] w-px bg-gradient-to-b from-signal via-alert to-ok md:left-[19px]" />
          {mockReport.investigationSteps.map((step, i) => (
            <motion.li
              key={step.step}
              initial={{ opacity: 0, x: -12 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="relative grid grid-cols-[40px_1fr] gap-4 py-3 md:grid-cols-[48px_140px_1fr_90px]"
            >
              <div className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full border border-signal/50 bg-void text-ok md:h-10 md:w-10">
                <CheckCircle2 className="h-4 w-4" />
              </div>
              <p className="hidden font-mono text-xs text-signal md:block">{step.agent}</p>
              <div>
                <p className="font-semibold text-ink">
                  <span className="mr-2 font-display text-alert">{String(step.step).padStart(2, '0')}</span>
                  {step.title}
                </p>
                <p className="font-mono text-xs text-muted md:hidden">{step.agent}</p>
              </div>
              <p className="font-mono text-xs text-muted md:text-right">{step.at}</p>
            </motion.li>
          ))}
        </ol>
      </Panel>
    </section>
  )
}
