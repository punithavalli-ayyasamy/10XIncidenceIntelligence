import { motion } from 'framer-motion'
import { mockReport } from '@/data/mockReport'
import { AnimatedCounter } from '@/components/shared/AnimatedCounter'
import { ConfidenceMeter } from '@/components/shared/ConfidenceMeter'
import { PredictionCountdown } from '@/components/shared/PredictionCountdown'
import { SeverityBadge } from '@/components/shared/SeverityBadge'
import { Badge } from '@/components/ui/badge'
import { Panel } from '@/components/ui/panel'

export function DashboardView() {
  return (
    <div className="grid h-full min-h-0 grid-rows-[auto_auto_1fr] gap-3 p-3 md:p-4">
      {/* Top row — 5 KPI cards */}
      <div className="grid min-h-0 grid-cols-2 gap-2 lg:grid-cols-5">
        <Panel className="p-3" glow="red">
          <div className="mb-1 flex items-center justify-between gap-2">
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted">Incident</p>
            <SeverityBadge severity={mockReport.detection.severity} />
          </div>
          <p className="font-display text-sm text-ink">{mockReport.incidentId}</p>
          <p className="mt-1 line-clamp-3 text-xs leading-snug text-ink-dim">
            {mockReport.detection.summary}
          </p>
        </Panel>

        <Panel className="p-3" glow="orange">
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted">Root Cause</p>
          <p className="mt-1 line-clamp-4 text-xs leading-snug text-ink-dim">
            {mockReport.investigation.root_cause}
          </p>
        </Panel>

        <Panel className="p-3" glow="blue">
          <ConfidenceMeter value={mockReport.investigation.confidence} label="AI Confidence" scale={100} />
          <p className="mt-2 font-mono text-[10px] text-muted">
            Detection {(mockReport.detection.confidence * 100).toFixed(0)}% · RCA{' '}
            {mockReport.investigation.confidence}%
          </p>
        </Panel>

        <PredictionCountdown initialMinutes={mockReport.predictionMinutesRemaining} />

        <Panel className="p-3" glow="red">
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted">Business Impact</p>
          <p className="mt-1 font-display text-2xl text-critical">
            $<AnimatedCounter value={42.7} decimals={1} />k
            <span className="text-sm text-muted"> /min</span>
          </p>
          <p className="mt-1 text-xs text-ink-dim">Checkout −38% · 126k shoppers · SLA burn 14.2×</p>
        </Panel>
      </div>

      {/* Middle — 10-step progress */}
      <Panel className="px-3 py-2.5" glow="blue">
        <div className="mb-2 flex items-center justify-between">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-signal">
            10-Step Autonomous Investigation
          </p>
          <Badge tone="ok">9/10 complete · Healing Agent armed</Badge>
        </div>
        <div className="grid grid-cols-5 gap-1.5 lg:grid-cols-10">
          {mockReport.investigationSteps.map((step, i) => (
            <motion.div
              key={step.step}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="rounded-lg border border-line/70 bg-void/40 px-1.5 py-2 text-center"
            >
              <p className="font-display text-sm text-signal">{String(step.step).padStart(2, '0')}</p>
              <p className="truncate font-mono text-[9px] text-alert">{step.agent}</p>
              <p className="mt-0.5 line-clamp-2 text-[10px] leading-tight text-ink-dim">{step.title}</p>
              <p
                className={`mt-1 font-mono text-[9px] uppercase ${
                  step.status === 'ready' ? 'text-alert' : 'text-ok'
                }`}
              >
                {step.status}
              </p>
            </motion.div>
          ))}
        </div>
      </Panel>

      {/* Bottom — 3 panels */}
      <div className="grid min-h-0 grid-cols-1 gap-3 lg:grid-cols-3">
        <Panel className="flex min-h-0 flex-col p-3" glow="blue">
          <p className="mb-2 shrink-0 font-mono text-[10px] uppercase tracking-widest text-signal">
            Top 10 Insights
          </p>
          <ul className="min-h-0 space-y-1.5 overflow-auto pr-1">
            {mockReport.insights.map((insight) => (
              <li
                key={insight.id}
                className="rounded-lg border border-line/50 bg-void/35 px-2.5 py-1.5"
              >
                <p className="text-xs font-semibold text-ink">
                  <span className="mr-1.5 font-display text-alert">
                    {String(insight.id).padStart(2, '0')}
                  </span>
                  {insight.title}
                </p>
                <p className="text-[11px] text-ink-dim">{insight.detail}</p>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel className="flex min-h-0 flex-col p-3" glow="orange">
          <p className="mb-2 shrink-0 font-mono text-[10px] uppercase tracking-widest text-alert">
            Service Health Overview
          </p>
          <ul className="min-h-0 space-y-1.5 overflow-auto pr-1">
            {mockReport.criticalServices.map((svc) => (
              <li key={svc.id} className="rounded-lg border border-line/50 bg-void/35 px-2.5 py-1.5">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-xs font-semibold text-ink">{svc.name}</p>
                  <span
                    className={`font-display text-sm ${
                      svc.health < 40 ? 'text-critical' : svc.health < 70 ? 'text-alert' : 'text-ok'
                    }`}
                  >
                    {svc.health}%
                  </span>
                </div>
                <div className="mt-1 h-1 overflow-hidden rounded-full bg-void">
                  <div
                    className={`h-full rounded-full ${
                      svc.health < 40 ? 'bg-critical' : svc.health < 70 ? 'bg-alert' : 'bg-ok'
                    }`}
                    style={{ width: `${svc.health}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel className="flex min-h-0 flex-col p-3" glow="red">
          <p className="mb-2 shrink-0 font-mono text-[10px] uppercase tracking-widest text-critical">
            Recommended Actions
          </p>
          <ul className="min-h-0 space-y-1.5 overflow-auto pr-1">
            {mockReport.recommendations.slice(0, 4).map((rec) => (
              <li key={rec.id} className="rounded-lg border border-line/50 bg-void/35 px-2.5 py-1.5">
                <div className="flex items-center gap-2">
                  <Badge tone={rec.priority === 'P0' ? 'critical' : 'alert'}>{rec.priority}</Badge>
                  <span className="font-mono text-[10px] text-muted">{rec.targetService}</span>
                </div>
                <p className="mt-1 text-xs font-semibold leading-snug text-ink">{rec.recommendation}</p>
                <p className="mt-0.5 text-[11px] text-ink-dim">
                  ETA {rec.estimatedRecoveryTime} · Conf {rec.confidence}%
                </p>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </div>
  )
}
