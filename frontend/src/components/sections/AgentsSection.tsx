import { motion } from 'framer-motion'
import { Bot } from 'lucide-react'
import { mockReport } from '@/data/mockReport'
import { SectionHeader } from '@/components/shared/SectionHeader'
import { Badge } from '@/components/ui/badge'
import { Panel } from '@/components/ui/panel'

export function AgentsSection() {
  return (
    <section id="agents" className="mx-auto max-w-7xl px-4 py-14 md:px-6">
      <SectionHeader
        index={9}
        title="Top 10 Autonomous AI Agents"
        subtitle="Live status of the agent mesh powering detection through self-heal."
      />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {mockReport.agents.map((agent, i) => (
          <motion.div
            key={agent.name}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.04 }}
          >
            <Panel className="h-full p-4" glow={agent.status === 'degraded' ? 'orange' : 'blue'}>
              <div className="mb-3 flex items-center justify-between">
                <Bot className="h-5 w-5 text-signal" />
                <Badge tone={agent.status === 'online' ? 'ok' : 'alert'}>{agent.status}</Badge>
              </div>
              <p className="font-display text-xs text-muted">{String(i + 1).padStart(2, '0')}</p>
              <h3 className="text-base font-semibold text-ink">{agent.name}</h3>
              <p className="text-sm text-ink-dim">{agent.role}</p>
              <p className="mt-2 font-mono text-[10px] uppercase tracking-widest text-muted">
                heartbeat {agent.lastBeat}
              </p>
            </Panel>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
