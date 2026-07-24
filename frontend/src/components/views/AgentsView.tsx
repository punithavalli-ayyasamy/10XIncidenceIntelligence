import { motion } from 'framer-motion'
import { Bot, Radar, Search, Compass, Eye, Crosshair } from 'lucide-react'
import { useReport } from '@/report/ReportContext'
import { ConfidenceMeter } from '@/components/shared/ConfidenceMeter'
import { Badge } from '@/components/ui/badge'
import { Panel } from '@/components/ui/panel'

const icons = {
  sentinel: Radar,
  investigator: Search,
  navigator: Compass,
  oracle: Eye,
  healer: Crosshair,
} as const

export function AgentsView() {
  const { report } = useReport()

  return (
    <div className="flex h-full min-h-0 flex-col gap-3 p-3 md:p-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="max-w-2xl">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-signal">
            AI Agents
          </p>
          <h2 className="font-display text-xl text-ink">
            Five specialists working this incident
          </h2>
          <p className="mt-1 text-sm text-ink-dim">
            Think of them like a response team: one spots the problem, one finds the cause,
            one maps the damage, one predicts what happens next, and one proposes the fix.
          </p>
        </div>
        <Badge tone="ok">Pipeline ready</Badge>
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-5">
        {report.missionAgents.map((agent, i) => {
          const Icon = icons[agent.id as keyof typeof icons] ?? Bot
          return (
            <motion.div
              key={agent.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="min-h-0"
            >
              <Panel
                className="flex h-full flex-col gap-3 p-4"
                glow={agent.status === 'armed' ? 'orange' : 'blue'}
              >
                <div className="flex items-start justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-signal/30 bg-signal/10">
                    <Icon className="h-5 w-5 text-signal" />
                  </div>
                  <Badge tone={agent.status === 'armed' ? 'alert' : 'ok'}>{agent.status}</Badge>
                </div>
                <div>
                  <h3 className="font-display text-lg text-ink">{agent.name}</h3>
                  <p className="mt-1 text-sm font-medium text-signal">{agent.plainJob}</p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-lg bg-void/40 px-2 py-1.5">
                    <p className="font-mono text-[9px] text-muted">Took</p>
                    <p className="font-display text-sm text-signal">{agent.executionTime}</p>
                  </div>
                  <div className="rounded-lg bg-void/40 px-2 py-1.5">
                    <p className="font-mono text-[9px] text-muted">Confidence</p>
                    <p className="font-display text-sm text-alert">{agent.confidence}%</p>
                  </div>
                </div>
                <ConfidenceMeter value={agent.confidence} label="How sure is this agent" scale={100} />
                <p className="mt-auto text-xs leading-relaxed text-ink-dim">{agent.summary}</p>
              </Panel>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
