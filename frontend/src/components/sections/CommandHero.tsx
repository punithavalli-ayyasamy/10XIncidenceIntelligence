import { motion } from 'framer-motion'
import { Activity, Shield, Zap } from 'lucide-react'
import { mockReport } from '@/data/mockReport'
import { AnimatedCounter } from '@/components/shared/AnimatedCounter'
import { ConfidenceMeter } from '@/components/shared/ConfidenceMeter'
import { LiveIncidentFeed } from '@/components/shared/LiveIncidentFeed'
import { PredictionCountdown } from '@/components/shared/PredictionCountdown'
import { SeverityBadge } from '@/components/shared/SeverityBadge'
import { Badge } from '@/components/ui/badge'
import { Panel } from '@/components/ui/panel'

export function CommandHero() {
  return (
    <section className="relative overflow-hidden border-b border-line">
      <div className="grid-cyber absolute inset-0 opacity-40" />
      <div className="relative mx-auto max-w-7xl px-4 py-10 md:px-6 md:py-14">
        <div className="mb-8 flex flex-wrap items-center gap-3">
          <Badge tone="alert">{mockReport.anniversary}</Badge>
          <Badge tone="signal">AI Ops Command Center</Badge>
          <Badge tone="critical">Black Friday Simulation</Badge>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.35fr_0.9fr]">
          <div>
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="font-mono text-xs uppercase tracking-[0.28em] text-signal"
            >
              Decade of Reliability · Built for Judging Day
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="mt-3 font-display text-4xl font-bold leading-tight tracking-wide text-ink text-glow-blue md:text-6xl"
            >
              10X Incident
              <span className="block text-alert text-glow-orange">Intelligence</span>
            </motion.h1>
            <p className="mt-4 max-w-2xl text-lg text-ink-dim md:text-xl">{mockReport.tagline}</p>

            <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                { label: 'Speedup', value: mockReport.speedup, suffix: '×', icon: Zap },
                { label: 'AI MTTR', value: mockReport.mttrMinutesAi, suffix: 'm', decimals: 1, icon: Activity },
                { label: 'RCA conf.', value: mockReport.investigation.confidence, suffix: '%', icon: Shield },
                { label: 'Agents', value: 10, suffix: '', icon: Activity },
              ].map((stat) => (
                <Panel key={stat.label} className="p-3" glow="none">
                  <stat.icon className="mb-2 h-4 w-4 text-signal" />
                  <AnimatedCounter
                    value={stat.value}
                    decimals={'decimals' in stat ? (stat.decimals as number) : 0}
                    suffix={stat.suffix}
                    className="text-2xl text-ink"
                  />
                  <p className="font-mono text-[10px] uppercase tracking-widest text-muted">{stat.label}</p>
                </Panel>
              ))}
            </div>

            <Panel className="mt-6 p-5" glow="blue">
              <div className="mb-3 flex flex-wrap items-center gap-3">
                <h2 className="font-display text-sm tracking-wider text-signal">EXECUTIVE AI SUMMARY</h2>
                <SeverityBadge severity={mockReport.detection.severity} />
              </div>
              <p className="text-base leading-relaxed text-ink-dim md:text-lg">
                {mockReport.executiveSummary}
              </p>
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <ConfidenceMeter value={mockReport.detection.confidence} label="Detection confidence" scale={1} />
                <ConfidenceMeter value={mockReport.investigation.confidence} label="RCA confidence" scale={100} />
              </div>
            </Panel>

            <Panel className="mt-4 p-5" glow="red">
              <h3 className="mb-2 font-display text-sm tracking-wider text-critical">ROOT CAUSE</h3>
              <p className="text-ink-dim">{mockReport.investigation.root_cause}</p>
            </Panel>
          </div>

          <div className="space-y-4">
            <LiveIncidentFeed />
            <PredictionCountdown initialMinutes={mockReport.predictionMinutesRemaining} />
            <Panel className="p-4" glow="orange">
              <h3 className="mb-2 font-display text-sm tracking-wider text-alert">
                BLACK FRIDAY TRAFFIC SIM
              </h3>
              <p className="text-sm text-ink-dim">
                Traffic multiplier peaked at{' '}
                <span className="font-display text-alert">5.4×</span> baseline while payment DB pool
                hit <span className="font-display text-critical">100/100</span>.
              </p>
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-void">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-signal via-alert to-critical"
                  initial={{ width: '10%' }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 3.2, ease: 'easeInOut', repeat: Infinity, repeatType: 'mirror' }}
                />
              </div>
              <p className="mt-2 font-mono text-[10px] uppercase tracking-widest text-muted">
                Simulated load · 10-minute collapse window
              </p>
            </Panel>
          </div>
        </div>
      </div>
    </section>
  )
}
