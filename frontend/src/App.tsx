import { CommandHero } from '@/components/sections/CommandHero'
import { InsightsSection } from '@/components/sections/InsightsSection'
import { InvestigationTimelineSection } from '@/components/sections/InvestigationTimelineSection'
import { MetricsSection } from '@/components/sections/MetricsSection'
import { CriticalServicesSection } from '@/components/sections/CriticalServicesSection'
import { BusinessImpactSection } from '@/components/sections/BusinessImpactSection'
import { RecommendationsSection } from '@/components/sections/RecommendationsSection'
import { DependencyGraphSection } from '@/components/sections/DependencyGraphSection'
import { StatisticsSection } from '@/components/sections/StatisticsSection'
import { AgentsSection } from '@/components/sections/AgentsSection'
import { SelfHealingSection } from '@/components/sections/SelfHealingSection'
import { mockReport } from '@/data/mockReport'

const nav = [
  { href: '#insights', label: '01 Insights' },
  { href: '#timeline', label: '02 Timeline' },
  { href: '#metrics', label: '03 Metrics' },
  { href: '#services', label: '04 Services' },
  { href: '#impact', label: '05 Impact' },
  { href: '#recommendations', label: '06 Recs' },
  { href: '#dependencies', label: '07 Graph' },
  { href: '#stats', label: '08 Stats' },
  { href: '#agents', label: '09 Agents' },
  { href: '#healing', label: '10 Heal' },
]

export default function App() {
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-50 border-b border-line/80 bg-void/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 md:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-md border border-signal/40 bg-signal/10 font-display text-sm font-bold text-signal">
              10X
            </div>
            <div>
              <p className="font-display text-sm tracking-wide text-ink">{mockReport.brand}</p>
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted">
                {mockReport.anniversary}
              </p>
            </div>
          </div>
          <nav className="hidden max-w-3xl flex-wrap justify-end gap-1 lg:flex">
            {nav.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="rounded px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-ink-dim transition hover:bg-panel-2 hover:text-signal"
              >
                {item.label}
              </a>
            ))}
          </nav>
        </div>
      </header>

      <main>
        <CommandHero />
        <InsightsSection />
        <InvestigationTimelineSection />
        <MetricsSection />
        <CriticalServicesSection />
        <BusinessImpactSection />
        <RecommendationsSection />
        <DependencyGraphSection />
        <StatisticsSection />
        <AgentsSection />
        <SelfHealingSection />
      </main>

      <footer className="border-t border-line py-10">
        <div className="mx-auto max-w-7xl px-4 text-center md:px-6">
          <p className="font-display text-2xl text-signal text-glow-blue">10× Faster. 10 Agents. 10 Steps.</p>
          <p className="mt-2 text-ink-dim">{mockReport.tagline}</p>
          <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
            Hackathon Command Center · Mock telemetry aligned to backend payment_metrics.json
          </p>
        </div>
      </footer>
    </div>
  )
}
