import { mockReport } from '@/data/mockReport'
import { AnimatedCounter } from '@/components/shared/AnimatedCounter'
import { SectionHeader } from '@/components/shared/SectionHeader'
import { Panel } from '@/components/ui/panel'

export function StatisticsSection() {
  return (
    <section id="stats" className="mx-auto max-w-7xl px-4 py-14 md:px-6">
      <SectionHeader
        index={8}
        title="Top 10 Incident Statistics"
        subtitle="The scoreboard that proves the 10× story for the judging panel."
      />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {mockReport.statistics.map((stat) => (
          <Panel key={stat.label} className="p-4 text-center" glow="blue">
            <AnimatedCounter
              value={stat.value}
              decimals={Number.isInteger(stat.value) ? 0 : 1}
              suffix={stat.suffix}
              className="text-3xl text-signal text-glow-blue"
            />
            <p className="mt-2 text-sm text-ink-dim">{stat.label}</p>
          </Panel>
        ))}
      </div>
    </section>
  )
}
