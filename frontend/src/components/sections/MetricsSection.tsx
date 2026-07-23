import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import metricsSample from '@/data/metrics_sample.json'
import { SectionHeader } from '@/components/shared/SectionHeader'
import { Panel } from '@/components/ui/panel'

const chartData = metricsSample.timeline.map((row) => ({
  t: row.timestamp.slice(11, 16),
  rps: row.requests_per_sec,
  latency: row.latency_ms,
  cpu: row.cpu,
  errors: Number((row.error_rate * 100).toFixed(2)),
  db: row.db_connections_used,
}))

const metricCards = [
  { key: 'RPS peak', value: '5,801' },
  { key: 'Latency peak', value: '2,418ms' },
  { key: 'CPU peak', value: '96.8%' },
  { key: 'Error peak', value: '28%' },
  { key: 'DB pool', value: '100/100' },
  { key: 'Threads', value: '97.8%' },
  { key: 'Success floor', value: '72%' },
  { key: 'Traffic ×', value: '5.4' },
  { key: 'Memory', value: '91%' },
  { key: 'Window', value: '60 min' },
]

export function MetricsSection() {
  return (
    <section id="metrics" className="mx-auto max-w-7xl px-4 py-14 md:px-6">
      <SectionHeader
        index={3}
        title="Top 10 System Metrics"
        subtitle="Black Friday payment telemetry — the same series DetectionAgent reasoned over."
      />
      <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-5">
        {metricCards.map((m) => (
          <Panel key={m.key} className="px-3 py-2" glow="none">
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted">{m.key}</p>
            <p className="font-display text-lg text-signal">{m.value}</p>
          </Panel>
        ))}
      </div>
      <Panel className="h-[360px] p-4" glow="orange">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="rps" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#2f9bff" stopOpacity={0.45} />
                <stop offset="100%" stopColor="#2f9bff" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="lat" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ff7a18" stopOpacity={0.4} />
                <stop offset="100%" stopColor="#ff7a18" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#1a2f4a" strokeDasharray="3 3" />
            <XAxis dataKey="t" stroke="#7f94b0" tick={{ fill: '#7f94b0', fontSize: 11 }} />
            <YAxis stroke="#7f94b0" tick={{ fill: '#7f94b0', fontSize: 11 }} />
            <Tooltip
              contentStyle={{
                background: '#0a1220',
                border: '1px solid #1a2f4a',
                borderRadius: 8,
                color: '#e8f1ff',
              }}
            />
            <Legend />
            <Area type="monotone" dataKey="rps" name="RPS" stroke="#2f9bff" fill="url(#rps)" />
            <Area type="monotone" dataKey="latency" name="Latency ms" stroke="#ff7a18" fill="url(#lat)" />
            <Area type="monotone" dataKey="db" name="DB conns" stroke="#ff3b4e" fill="transparent" />
          </AreaChart>
        </ResponsiveContainer>
      </Panel>
    </section>
  )
}
