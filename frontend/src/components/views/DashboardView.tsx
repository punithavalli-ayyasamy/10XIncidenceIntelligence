import { useReport } from '@/report/ReportContext'
import { AnimatedCounter } from '@/components/shared/AnimatedCounter'
import { ConfidenceMeter } from '@/components/shared/ConfidenceMeter'
import { PredictionCountdown } from '@/components/shared/PredictionCountdown'
import { SeverityBadge } from '@/components/shared/SeverityBadge'
import { Badge } from '@/components/ui/badge'
import { Panel } from '@/components/ui/panel'

export function DashboardView() {
  const { report, healed } = useReport()

  return (
    <div
      className={`flex h-full min-h-0 flex-col gap-3 p-3 transition-colors duration-500 md:p-4 ${
        healed ? 'rounded-xl bg-ok/5 ring-1 ring-ok/30' : ''
      }`}
    >
      {healed && (
        <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 rounded-xl border border-ok/40 bg-ok/10 px-3 py-2">
          <p className="font-display text-sm text-ok">Incident contained — self-heal verified</p>
          <Badge tone="ok">RESOLVED · systems recovering</Badge>
        </div>
      )}

      <div className="grid shrink-0 grid-cols-2 gap-2 lg:grid-cols-5">
        <Panel className="p-3" glow={healed ? 'green' : 'red'}>
          <div className="mb-1 flex items-center justify-between gap-2">
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted">Incident</p>
            {healed ? (
              <Badge tone="ok">RESOLVED</Badge>
            ) : (
              <SeverityBadge severity={report.detection.severity} />
            )}
          </div>
          <p className="font-display text-sm text-ink">{report.incidentId}</p>
          <p className="mt-1 line-clamp-3 text-xs leading-snug text-ink-dim">
            {healed
              ? 'CRITICAL cleared · payment-service pool recovered · incident resolving.'
              : report.detection.summary}
          </p>
        </Panel>

        <Panel className="p-3" glow={healed ? 'green' : 'orange'}>
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted">Root Cause</p>
          <p className="mt-1 line-clamp-4 text-xs leading-snug text-ink-dim">
            {report.investigation.root_cause}
          </p>
        </Panel>

        <Panel className="p-3" glow={healed ? 'green' : 'blue'}>
          <ConfidenceMeter value={report.investigation.confidence} label="AI Confidence" scale={100} />
          <p className="mt-2 font-mono text-[10px] text-muted">
            Detection {(report.detection.confidence * 100).toFixed(0)}% · RCA{' '}
            {report.investigation.confidence}%
          </p>
        </Panel>

        <PredictionCountdown initialMinutes={report.predictionMinutesRemaining} />

        <Panel className="p-3" glow={healed ? 'green' : 'red'}>
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted">
            {healed ? 'Revenue protected' : 'Business Impact'}
          </p>
          {healed ? (
            <>
              <p className="mt-1 font-display text-2xl text-ok">
                $<AnimatedCounter value={0} decimals={0} />
                <span className="text-sm text-muted"> /min</span>
              </p>
              <p className="mt-1 text-xs text-ink-dim">Risk window closed · checkout recovering</p>
            </>
          ) : (
            <>
              <p className="mt-1 font-display text-2xl text-critical">
                $<AnimatedCounter value={42.7} decimals={1} />k
                <span className="text-sm text-muted"> /min</span>
              </p>
              <p className="mt-1 text-xs text-ink-dim">Checkout −38% · 126k shoppers · SLA burn 14.2×</p>
            </>
          )}
        </Panel>
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-3 lg:grid-cols-3">
        <Panel className="flex min-h-0 flex-col p-3" glow={healed ? 'green' : 'blue'}>
          <p
            className={`mb-2 shrink-0 font-mono text-[10px] uppercase tracking-widest ${
              healed ? 'text-ok' : 'text-signal'
            }`}
          >
            Top insights
          </p>
          <ul className="min-h-0 space-y-1.5 overflow-auto pr-1">
            {report.insights.map((insight) => (
              <li
                key={insight.id}
                className={`rounded-lg border px-2.5 py-1.5 ${
                  healed ? 'border-ok/30 bg-ok/5' : 'border-line/50 bg-void/35'
                }`}
              >
                <p className="text-xs font-semibold text-ink">
                  <span className={`mr-1.5 font-display ${healed ? 'text-ok' : 'text-alert'}`}>
                    {String(insight.id).padStart(2, '0')}
                  </span>
                  {insight.title}
                </p>
                <p className="text-[11px] text-ink-dim">{insight.detail}</p>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel className="flex min-h-0 flex-col p-3" glow={healed ? 'green' : 'orange'}>
          <p
            className={`mb-2 shrink-0 font-mono text-[10px] uppercase tracking-widest ${
              healed ? 'text-ok' : 'text-alert'
            }`}
          >
            Service health
          </p>
          <ul className="min-h-0 space-y-1.5 overflow-auto pr-1">
            {report.criticalServices.map((svc) => {
              const health = healed
                ? Math.min(98, svc.health < 50 ? svc.health + 55 : Math.max(svc.health, 88))
                : svc.health
              return (
                <li
                  key={svc.id}
                  className={`rounded-lg border px-2.5 py-1.5 ${
                    healed ? 'border-ok/30 bg-ok/5' : 'border-line/50 bg-void/35'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-xs font-semibold text-ink">{svc.name}</p>
                    <span
                      className={`font-display text-sm ${
                        health < 40 ? 'text-critical' : health < 70 ? 'text-alert' : 'text-ok'
                      }`}
                    >
                      {health}%
                    </span>
                  </div>
                  <div className="mt-1 h-1 overflow-hidden rounded-full bg-void">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        health < 40 ? 'bg-critical' : health < 70 ? 'bg-alert' : 'bg-ok'
                      }`}
                      style={{ width: `${health}%` }}
                    />
                  </div>
                </li>
              )
            })}
          </ul>
        </Panel>

        <Panel className="flex min-h-0 flex-col p-3" glow={healed ? 'green' : 'red'}>
          <p
            className={`mb-2 shrink-0 font-mono text-[10px] uppercase tracking-widest ${
              healed ? 'text-ok' : 'text-critical'
            }`}
          >
            {healed ? 'Actions verified' : 'Recommended actions'}
          </p>
          <ul className="min-h-0 space-y-1.5 overflow-auto pr-1">
            {report.recommendations.slice(0, 4).map((rec) => (
              <li
                key={rec.id}
                className={`rounded-lg border px-2.5 py-1.5 ${
                  healed ? 'border-ok/30 bg-ok/5' : 'border-line/50 bg-void/35'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Badge tone={healed ? 'ok' : rec.priority === 'P0' ? 'critical' : 'alert'}>
                    {healed ? 'done' : rec.priority}
                  </Badge>
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
