import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'
import { mockReport } from '@/data/mockReport'
import { SectionHeader } from '@/components/shared/SectionHeader'
import { Badge } from '@/components/ui/badge'
import { Panel } from '@/components/ui/panel'

export function RecommendationsSection() {
  return (
    <section id="recommendations" className="mx-auto max-w-7xl px-4 py-14 md:px-6">
      <SectionHeader
        index={6}
        title="Top 10 AI Recommendations"
        subtitle="Ranked remediations from RecommendationAgent — ready for SelfHealExecutor."
      />
      <div className="space-y-2">
        {mockReport.recommendations.map((rec, i) => (
          <motion.div
            key={rec.rank}
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.04 }}
          >
            <Panel className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between" glow="blue">
              <div className="flex items-start gap-3">
                <span className="font-display text-2xl text-signal">{String(rec.rank).padStart(2, '0')}</span>
                <div>
                  <p className="flex items-center gap-2 text-base font-semibold text-ink">
                    <Sparkles className="h-4 w-4 text-alert" />
                    {rec.action}
                  </p>
                  <p className="font-mono text-xs text-muted">ETA {rec.eta}</p>
                </div>
              </div>
              <Badge
                tone={
                  rec.impact === 'critical' ? 'critical' : rec.impact === 'high' ? 'alert' : 'signal'
                }
              >
                {rec.impact}
              </Badge>
            </Panel>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
