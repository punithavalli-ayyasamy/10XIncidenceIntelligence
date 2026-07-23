import { motion } from 'framer-motion'
import { mockReport } from '@/data/mockReport'
import { SectionHeader } from '@/components/shared/SectionHeader'
import { Badge } from '@/components/ui/badge'
import { Panel } from '@/components/ui/panel'

export function CriticalServicesSection() {
  return (
    <section id="services" className="mx-auto max-w-7xl px-4 py-14 md:px-6">
      <SectionHeader
        index={4}
        title="Top 10 Critical Services"
        subtitle="Health scores across the 10-node commerce mesh during the incident window."
      />
      <div className="grid gap-3 md:grid-cols-2">
        {mockReport.criticalServices.map((svc, i) => (
          <motion.div
            key={svc.name}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.03 }}
          >
            <Panel className="p-4" glow={svc.health < 40 ? 'red' : svc.health < 70 ? 'orange' : 'blue'}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-display text-xs text-muted">{String(i + 1).padStart(2, '0')}</p>
                  <h3 className="text-lg font-semibold text-ink">{svc.name}</h3>
                  <p className="font-mono text-xs text-muted">{svc.owner} · SLA {svc.sla}%</p>
                </div>
                <Badge
                  tone={
                    svc.criticality === 'critical'
                      ? 'critical'
                      : svc.criticality === 'high'
                        ? 'alert'
                        : 'signal'
                  }
                >
                  {svc.criticality}
                </Badge>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span className="font-mono text-[10px] uppercase tracking-widest text-muted">Health</span>
                <span className="font-display text-xl text-ink">{svc.health}%</span>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-void">
                <div
                  className={`h-full rounded-full ${
                    svc.health < 40 ? 'bg-critical' : svc.health < 70 ? 'bg-alert' : 'bg-signal'
                  }`}
                  style={{ width: `${svc.health}%` }}
                />
              </div>
            </Panel>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
