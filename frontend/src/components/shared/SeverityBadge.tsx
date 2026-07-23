import { Badge } from '@/components/ui/badge'
import type { Severity } from '@/data/mockReport'

const map: Record<Severity, { tone: 'critical' | 'alert' | 'signal' | 'muted'; label: string }> = {
  critical: { tone: 'critical', label: 'CRITICAL' },
  high: { tone: 'alert', label: 'HIGH' },
  medium: { tone: 'signal', label: 'MEDIUM' },
  low: { tone: 'muted', label: 'LOW' },
}

export function SeverityBadge({ severity }: { severity: Severity }) {
  const cfg = map[severity]
  return <Badge tone={cfg.tone}>{cfg.label}</Badge>
}
