import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import metricsSample from '@/data/metrics_sample.json'
import { mockReport } from '@/data/mockReport'
import { ConfidenceMeter } from '@/components/shared/ConfidenceMeter'
import { Badge } from '@/components/ui/badge'
import { Panel } from '@/components/ui/panel'

const chartData = metricsSample.timeline.map((row) => ({
  t: row.timestamp.slice(11, 16),
  rps: row.requests_per_sec,
  latency: row.latency_ms,
  db: row.db_connections_used,
  errors: Number((row.error_rate * 100).toFixed(2)),
}))

export function InvestigationView() {
  return (
    <div className="grid h-full min-h-0 grid-cols-12 gap-3 p-3 md:p-4">
      {/* Evidence timeline */}
      <Panel className="col-span-12 flex min-h-0 flex-col p-3 lg:col-span-3" glow="blue">
        <p className="mb-2 font-mono text-[10px] uppercase tracking-widest text-signal">
          Evidence Timeline
        </p>
        <ul className="min-h-0 space-y-2 overflow-auto pr-1">
          {mockReport.evidenceTimeline.map((ev) => (
            <li key={`${ev.t}-${ev.title}`} className="relative border-l border-signal/30 pl-3">
              <p className="font-mono text-[10px] text-alert">
                {ev.t} · {ev.kind}
              </p>
              <p className="text-xs font-semibold text-ink">{ev.title}</p>
              <p className="text-[11px] text-ink-dim">{ev.detail}</p>
            </li>
          ))}
        </ul>
      </Panel>

      {/* Metric correlation + logs */}
      <div className="col-span-12 grid min-h-0 grid-rows-[1fr_1fr] gap-3 lg:col-span-5">
        <Panel className="flex min-h-0 flex-col p-3" glow="orange">
          <p className="mb-2 font-mono text-[10px] uppercase tracking-widest text-alert">
            Metric Correlation
          </p>
          <div className="mb-2 grid grid-cols-3 gap-1.5 sm:grid-cols-6">
            {mockReport.metricCorrelation.map((m) => (
              <div key={m.label} className="rounded-lg bg-void/40 px-1.5 py-1 text-center">
                <p className="font-mono text-[9px] text-muted">{m.label}</p>
                <p className="font-display text-[11px] text-ink-dim">
                  {m.early}
                  {m.unit}
                </p>
                <p className="font-display text-xs text-critical">
                  {m.late}
                  {m.unit}
                </p>
              </div>
            ))}
          </div>
          <div className="min-h-0 flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <CartesianGrid stroke="#1a2f4a" strokeDasharray="3 3" />
                <XAxis dataKey="t" tick={{ fill: '#7f94b0', fontSize: 10 }} stroke="#1a2f4a" />
                <YAxis tick={{ fill: '#7f94b0', fontSize: 10 }} stroke="#1a2f4a" width={36} />
                <Tooltip
                  contentStyle={{
                    background: '#0a1220',
                    border: '1px solid #1a2f4a',
                    borderRadius: 8,
                    fontSize: 11,
                  }}
                />
                <Area type="monotone" dataKey="rps" stroke="#3aa0ff" fill="#3aa0ff33" name="RPS" />
                <Area
                  type="monotone"
                  dataKey="latency"
                  stroke="#ff7a18"
                  fill="#ff7a1833"
                  name="Latency"
                />
                <Area type="monotone" dataKey="db" stroke="#ff3b4e" fill="transparent" name="DB" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel className="flex min-h-0 flex-col p-3" glow="red">
          <p className="mb-2 font-mono text-[10px] uppercase tracking-widest text-critical">
            Relevant Logs
          </p>
          <ul className="min-h-0 space-y-1.5 overflow-auto font-mono text-[11px]">
            {mockReport.relevantLogs.map((log) => (
              <li key={`${log.t}-${log.msg}`} className="rounded-lg bg-void/45 px-2 py-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone={log.level === 'ERROR' ? 'critical' : 'alert'}>{log.level}</Badge>
                  <span className="text-muted">{log.t}</span>
                  <span className="text-signal">{log.logger}</span>
                </div>
                <p className="mt-0.5 text-ink">{log.msg}</p>
                <p className="text-muted">{log.ctx}</p>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      {/* RCA panel */}
      <Panel className="col-span-12 flex min-h-0 flex-col gap-3 p-3 lg:col-span-4" glow="red">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-widest text-critical">Root Cause</p>
          <p className="mt-2 text-sm leading-relaxed text-ink">{mockReport.investigation.root_cause}</p>
        </div>
        <ConfidenceMeter
          value={mockReport.investigation.confidence}
          label="Investigation Confidence"
          scale={100}
        />
        <div className="min-h-0 flex-1 overflow-auto">
          <p className="mb-2 font-mono text-[10px] uppercase tracking-widest text-muted">
            Supporting Evidence
          </p>
          <ul className="space-y-1.5">
            {mockReport.investigation.supporting_evidence.map((ev) => (
              <li
                key={ev}
                className="rounded-lg border border-line/50 bg-void/40 px-2.5 py-1.5 text-xs text-ink-dim"
              >
                {ev}
              </li>
            ))}
          </ul>
        </div>
      </Panel>
    </div>
  )
}
