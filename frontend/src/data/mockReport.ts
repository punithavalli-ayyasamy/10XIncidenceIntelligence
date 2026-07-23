export type Severity = 'critical' | 'high' | 'medium' | 'low'

export const mockReport = {
  brand: '10X Incident Intelligence',
  anniversary: '10th Anniversary Hackathon',
  tagline:
    'AI autonomously detected, investigated, predicted and resolved a production incident 10× faster.',
  scenario: 'Black Friday payment-service degradation',
  generatedAt: '2025-11-28T14:00:12Z',
  mttrMinutesHuman: 47,
  mttrMinutesAi: 4.7,
  speedup: 10,
  predictionMinutesRemaining: 8,

  executiveSummary:
    'During Black Friday ramp, payment-service saturated its Postgres connection pool (100/100). Autonomous agents detected multi-metric degradation, traced root cause to HikariCP exhaustion under 5.4× traffic, predicted checkout collapse within 10 minutes, and executed a 10-step self-healing playbook—restoring payments 10× faster than the historical human MTTR.',

  detection: {
    incident_created: true,
    severity: 'critical' as Severity,
    confidence: 0.92,
    reason:
      'Latency, error rate, CPU, and DB connections rose together as traffic multiplier climbed from 1.03→5.4.',
    summary:
      'payment-service shows Black Friday–style degradation: traffic, latency, errors, and saturation worsened together.',
    affected_service: 'payment-service',
  },

  investigation: {
    root_cause:
      'Postgres connection pool exhaustion on payment-service under Black Friday traffic surge: rising RPS saturated the HikariCP pool (limit 100), causing acquire timeouts, retries, circuit-breaker opens, and cascading payment failures.',
    confidence: 95,
    supporting_evidence: [
      'Metric [14:00Z]: db_connections_used=100/100 (pool fully exhausted).',
      'Metric [13:01→14:00]: RPS 1166→5746, latency 191→2418ms, errors 0.08%→28%.',
      'Log [13:54Z] ERROR PaymentController: dependency saturation, db_pool=exhausted.',
      'Log [13:54Z] WARN CircuitBreaker: payment-psp OPEN, short_circuits=226.',
      'Deployment notes: pool max remained 100; checkout retries amplified load.',
    ],
    affected_services: [
      'payment-service',
      'checkout',
      'order',
      'fraud-detection',
      'postgres',
      'redis',
      'kafka',
      'api-gateway',
      'frontend',
      'notification',
    ],
  },

  insights: [
    { id: 1, title: 'Pool exhaustion is the terminal failure', detail: 'DB connections hit 100/100 at 13:59–14:00Z.' },
    { id: 2, title: 'Traffic multiplier 5.4× baseline', detail: 'Black Friday ramp, not a single bad deploy.' },
    { id: 3, title: 'Latency climbed 12×', detail: '191ms → 2418ms across the hour.' },
    { id: 4, title: 'Error rate 350×', detail: '0.08% → 28% success collapse in checkout path.' },
    { id: 5, title: 'Circuit breaker opened', detail: 'payment-psp OPEN with 226 short-circuits.' },
    { id: 6, title: 'Checkout retries amplified load', detail: 'Checkout 5.8.1 increased payment retries to 3.' },
    { id: 7, title: 'Kafka publish failures', detail: 'payment.events timed out into DLQ buffer.' },
    { id: 8, title: 'Thread pool near saturation', detail: 'HTTP threads at 97.8% utilization.' },
    { id: 9, title: 'Blast radius includes checkout+', detail: '10 services in dependency cone.' },
    { id: 10, title: 'AI MTTR 4.7 min vs 47 min human', detail: 'Exactly 10× faster resolution path.' },
  ],

  investigationSteps: [
    { step: 1, agent: 'Ingest', title: 'Receive metrics stream', status: 'done', at: '13:53:01' },
    { step: 2, agent: 'DetectionAgent', title: 'Multi-metric anomaly correlation', status: 'done', at: '13:53:08' },
    { step: 3, agent: 'DetectionAgent', title: 'Create critical incident', status: 'done', at: '13:53:09' },
    { step: 4, agent: 'InvestigationAgent', title: 'Pull logs + topology + deploys', status: 'done', at: '13:53:18' },
    { step: 5, agent: 'InvestigationAgent', title: 'Identify pool exhaustion RCA', status: 'done', at: '13:53:41' },
    { step: 6, agent: 'DependencyAgent', title: 'Map 10-service blast radius', status: 'done', at: '13:54:02' },
    { step: 7, agent: 'ImpactAgent', title: 'Estimate revenue / checkout risk', status: 'done', at: '13:54:15' },
    { step: 8, agent: 'PredictionAgent', title: 'Forecast collapse in <10 min', status: 'done', at: '13:54:28' },
    { step: 9, agent: 'RecommendationAgent', title: 'Rank top 10 remediations', status: 'done', at: '13:54:40' },
    { step: 10, agent: 'SelfHeal', title: 'Execute healing playbook', status: 'done', at: '13:57:42' },
  ],

  criticalServices: [
    { name: 'payment-service', criticality: 'critical', health: 28, owner: 'payments-team', sla: 99.95 },
    { name: 'checkout', criticality: 'critical', health: 41, owner: 'checkout-team', sla: 99.9 },
    { name: 'api-gateway', criticality: 'critical', health: 72, owner: 'platform-edge', sla: 99.95 },
    { name: 'postgres', criticality: 'critical', health: 22, owner: 'platform-data', sla: 99.99 },
    { name: 'order', criticality: 'critical', health: 55, owner: 'orders-team', sla: 99.9 },
    { name: 'fraud-detection', criticality: 'high', health: 61, owner: 'risk-team', sla: 99.9 },
    { name: 'inventory', criticality: 'high', health: 78, owner: 'inventory-team', sla: 99.9 },
    { name: 'redis', criticality: 'high', health: 84, owner: 'platform-data', sla: 99.95 },
    { name: 'kafka', criticality: 'high', health: 66, owner: 'platform-streaming', sla: 99.9 },
    { name: 'notification', criticality: 'medium', health: 80, owner: 'comms-team', sla: 99.5 },
  ],

  businessImpact: [
    { id: 1, label: 'Checkout conversion drop', value: '−38%', tone: 'critical' },
    { id: 2, label: 'Est. revenue at risk / min', value: '$42.7k', tone: 'critical' },
    { id: 3, label: 'Failed payment attempts', value: '18.4k', tone: 'alert' },
    { id: 4, label: 'Affected active shoppers', value: '126k', tone: 'alert' },
    { id: 5, label: 'SLA burn (payment)', value: '14.2×', tone: 'critical' },
    { id: 6, label: 'Cart abandonment spike', value: '+27%', tone: 'alert' },
    { id: 7, label: 'Support ticket surge', value: '+9.1×', tone: 'alert' },
    { id: 8, label: 'Promo redemption blocked', value: '61%', tone: 'alert' },
    { id: 9, label: 'Mobile checkout errors', value: '31%', tone: 'critical' },
    { id: 10, label: 'Brand trust score delta', value: '−0.8', tone: 'signal' },
  ],

  recommendations: [
    { rank: 1, action: 'Scale HikariCP max pool 100 → 250', impact: 'critical', eta: '30s' },
    { rank: 2, action: 'Enable payment read-replica for ledger lookups', impact: 'high', eta: '2m' },
    { rank: 3, action: 'Throttle checkout retries to 1 under CB OPEN', impact: 'high', eta: '20s' },
    { rank: 4, action: 'Shed non-critical fraud sync checks', impact: 'medium', eta: '45s' },
    { rank: 5, action: 'Increase payment pods 6 → 18', impact: 'high', eta: '90s' },
    { rank: 6, action: 'Open CB half-open with 5% probe', impact: 'medium', eta: '15s' },
    { rank: 7, action: 'Prioritize authorize over capture queue', impact: 'medium', eta: '40s' },
    { rank: 8, action: 'Flush Kafka DLQ after recovery', impact: 'low', eta: '3m' },
    { rank: 9, action: 'Page payments-oncall with RCA pack', impact: 'low', eta: 'instant' },
    { rank: 10, action: 'Lock feature flags for promo bursts', impact: 'medium', eta: '25s' },
  ],

  dependencyNodes: [
    { id: 'frontend', label: 'Frontend', type: 'frontend', criticality: 'high' },
    { id: 'api-gateway', label: 'API Gateway', type: 'gateway', criticality: 'critical' },
    { id: 'checkout', label: 'Checkout', type: 'service', criticality: 'critical' },
    { id: 'payment', label: 'Payment', type: 'service', criticality: 'critical', highlight: true },
    { id: 'order', label: 'Order', type: 'service', criticality: 'critical' },
    { id: 'inventory', label: 'Inventory', type: 'service', criticality: 'high' },
    { id: 'notification', label: 'Notification', type: 'service', criticality: 'medium' },
    { id: 'fraud-detection', label: 'Fraud', type: 'service', criticality: 'high' },
    { id: 'postgres', label: 'Postgres', type: 'database', criticality: 'critical', highlight: true },
    { id: 'redis', label: 'Redis', type: 'cache', criticality: 'high' },
    { id: 'kafka', label: 'Kafka', type: 'messaging', criticality: 'high' },
  ],

  dependencyEdges: [
    { source: 'frontend', target: 'api-gateway' },
    { source: 'api-gateway', target: 'checkout' },
    { source: 'checkout', target: 'payment' },
    { source: 'checkout', target: 'fraud-detection' },
    { source: 'checkout', target: 'inventory' },
    { source: 'payment', target: 'order' },
    { source: 'payment', target: 'postgres' },
    { source: 'payment', target: 'redis' },
    { source: 'payment', target: 'kafka' },
    { source: 'order', target: 'notification' },
  ],

  statistics: [
    { label: 'Incidents auto-detected (24h)', value: 10, suffix: '' },
    { label: 'Mean AI investigation time', value: 4.7, suffix: 'm' },
    { label: 'Human historical MTTR', value: 47, suffix: 'm' },
    { label: 'Speedup factor', value: 10, suffix: '×' },
    { label: 'Evidence artifacts cited', value: 12, suffix: '' },
    { label: 'Services in blast radius', value: 10, suffix: '' },
    { label: 'Remediations ranked', value: 10, suffix: '' },
    { label: 'Healing steps executed', value: 10, suffix: '' },
    { label: 'RCA confidence', value: 95, suffix: '%' },
    { label: 'Checkout recovery', value: 99, suffix: '%' },
  ],

  agents: [
    { name: 'DetectionAgent', status: 'online', role: 'Anomaly → incident', lastBeat: '2s' },
    { name: 'InvestigationAgent', status: 'online', role: 'Evidence RCA', lastBeat: '3s' },
    { name: 'DependencyAgent', status: 'online', role: 'Blast radius', lastBeat: '4s' },
    { name: 'ImpactAgent', status: 'online', role: 'Business impact', lastBeat: '5s' },
    { name: 'PredictionAgent', status: 'online', role: 'Collapse forecast', lastBeat: '3s' },
    { name: 'RecommendationAgent', status: 'online', role: 'Remediation rank', lastBeat: '6s' },
    { name: 'Orchestrator', status: 'online', role: 'Pipeline control', lastBeat: '1s' },
    { name: 'SelfHealExecutor', status: 'online', role: 'Playbook runner', lastBeat: '2s' },
    { name: 'TrafficSimAgent', status: 'degraded', role: 'BF load model', lastBeat: '9s' },
    { name: 'ReportSynthesizer', status: 'online', role: 'Exec summary', lastBeat: '4s' },
  ],

  healingTimeline: [
    { step: 1, title: 'Acknowledge critical incident', status: 'done', t: 'T+0s' },
    { step: 2, title: 'Freeze risky checkout feature flags', status: 'done', t: 'T+12s' },
    { step: 3, title: 'Raise DB pool max to 250', status: 'done', t: 'T+28s' },
    { step: 4, title: 'Scale payment pods 6 → 18', status: 'done', t: 'T+90s' },
    { step: 5, title: 'Throttle checkout retries', status: 'done', t: 'T+110s' },
    { step: 6, title: 'Drain saturated thread pools', status: 'done', t: 'T+140s' },
    { step: 7, title: 'Half-open payment-psp breaker', status: 'done', t: 'T+165s' },
    { step: 8, title: 'Replay Kafka DLQ safely', status: 'done', t: 'T+210s' },
    { step: 9, title: 'Validate RPS/latency SLO', status: 'done', t: 'T+250s' },
    { step: 10, title: 'Declare services restored', status: 'done', t: 'T+282s' },
  ],

  liveFeed: [
    { t: '14:00:12', level: 'critical', msg: 'Incident INC-BF-10 opened — payment pool exhausted' },
    { t: '14:00:18', level: 'warn', msg: 'DetectionAgent confidence 92% — multi-metric correlation' },
    { t: '14:00:41', level: 'info', msg: 'InvestigationAgent RCA: HikariCP exhaustion' },
    { t: '14:01:02', level: 'warn', msg: 'Prediction: checkout collapse in <10 minutes' },
    { t: '14:01:40', level: 'info', msg: 'RecommendationAgent published top 10 remediations' },
    { t: '14:02:10', level: 'info', msg: 'SelfHealExecutor started 10-step playbook' },
    { t: '14:04:52', level: 'ok', msg: 'Payment latency back under 250ms SLO' },
    { t: '14:05:12', level: 'ok', msg: 'Incident resolved — 10× faster than human MTTR' },
  ],
} as const

export type MockReport = typeof mockReport
