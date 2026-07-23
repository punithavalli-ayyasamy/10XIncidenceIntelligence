import { mockReport } from '@/data/mockReport'
import { AnimatedCounter } from '@/components/shared/AnimatedCounter'
import { SeverityBadge } from '@/components/shared/SeverityBadge'
import { Badge } from '@/components/ui/badge'
import { Panel } from '@/components/ui/panel'

export function ExecutiveView() {
  return (
    <div className="grid h-full min-h-0 grid-rows-[auto_1fr] gap-3 overflow-hidden p-3 md:p-4">
      <Panel className="p-4" glow="blue">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-signal">
              CTO Executive Brief · {mockReport.incidentId}
            </p>
            <h2 className="mt-1 font-display text-2xl text-ink">Black Friday Payment Incident</h2>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-ink-dim">
              {mockReport.executiveSummary}
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <SeverityBadge severity={mockReport.detection.severity} />
            <p className="font-display text-3xl text-signal text-glow-blue">
              <AnimatedCounter value={mockReport.speedup} />×
            </p>
            <p className="font-mono text-[10px] uppercase text-muted">Faster than human MTTR</p>
          </div>
        </div>
      </Panel>

      <div className="grid min-h-0 grid-cols-12 gap-3 overflow-hidden">
        <Panel className="col-span-12 overflow-auto p-3 lg:col-span-4" glow="red">
          <p className="font-mono text-[10px] uppercase tracking-widest text-critical">
            Business Impact
          </p>
          <ul className="mt-2 space-y-2">
            {mockReport.businessImpactTop.map((item) => (
              <li
                key={item.label}
                className="flex items-center justify-between rounded-lg bg-void/40 px-3 py-2"
              >
                <span className="text-xs text-ink-dim">{item.label}</span>
                <span
                  className={`font-display text-lg ${
                    item.tone === 'critical' ? 'text-critical' : 'text-alert'
                  }`}
                >
                  {item.value}
                </span>
              </li>
            ))}
            <li className="rounded-lg border border-critical/30 bg-critical/10 px-3 py-2">
              <p className="font-mono text-[9px] uppercase text-critical">Revenue risk window</p>
              <p className="font-display text-xl text-ink">{mockReport.revenueAtRiskTotal}</p>
            </li>
          </ul>

          <p className="mt-4 font-mono text-[10px] uppercase tracking-widest text-alert">
            Root Cause
          </p>
          <p className="mt-1 text-xs leading-relaxed text-ink-dim">
            {mockReport.investigation.root_cause}
          </p>

          <p className="mt-4 font-mono text-[10px] uppercase tracking-widest text-signal">
            Predicted Outage
          </p>
          <p className="mt-1 text-xs text-ink-dim">
            Checkout collapse forecast inside{' '}
            <span className="font-semibold text-alert">
              &lt;{mockReport.predictionMinutesRemaining} minutes
            </span>{' '}
            if unrecovered.
          </p>
        </Panel>

        <Panel className="col-span-12 flex min-h-0 flex-col overflow-hidden p-3 lg:col-span-4" glow="orange">
          <p className="font-mono text-[10px] uppercase tracking-widest text-alert">
            10 Key Insights
          </p>
          <ul className="mt-2 min-h-0 space-y-1.5 overflow-auto">
            {mockReport.insights.map((insight) => (
              <li key={insight.id} className="rounded-lg bg-void/35 px-2.5 py-1.5">
                <p className="text-xs font-semibold text-ink">
                  <span className="mr-1 font-display text-alert">
                    {String(insight.id).padStart(2, '0')}
                  </span>
                  {insight.title}
                </p>
                <p className="text-[11px] text-ink-dim">{insight.detail}</p>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel className="col-span-12 flex min-h-0 flex-col overflow-hidden p-3 lg:col-span-4" glow="blue">
          <p className="font-mono text-[10px] uppercase tracking-widest text-signal">
            Affected Services
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {mockReport.investigation.affected_services.map((svc) => (
              <Badge key={svc} tone="muted">
                {svc}
              </Badge>
            ))}
          </div>

          <p className="mt-4 font-mono text-[10px] uppercase tracking-widest text-signal">
            Recommended Actions
          </p>
          <ul className="mt-2 min-h-0 space-y-1.5 overflow-auto">
            {mockReport.recommendations.map((rec) => (
              <li key={rec.id} className="rounded-lg bg-void/35 px-2.5 py-1.5">
                <div className="flex items-center gap-2">
                  <Badge tone={rec.priority === 'P0' ? 'critical' : 'alert'}>{rec.priority}</Badge>
                  <span className="font-mono text-[10px] text-muted">{rec.targetService}</span>
                </div>
                <p className="mt-1 text-xs text-ink">{rec.recommendation}</p>
                <p className="text-[11px] text-ink-dim">
                  {rec.expectedImprovement} · ETA {rec.estimatedRecoveryTime}
                </p>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </div>
  )
}
