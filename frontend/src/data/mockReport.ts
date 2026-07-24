export type Severity = 'critical' | 'high' | 'medium' | 'low'
export type TabId =
  | 'dashboard'
  | 'investigation'
  | 'graph'
  | 'agents'
  | 'healing'
  | 'executive'

export type Recommendation = {
  id: string
  rank: number
  targetService: string
  priority: 'P0' | 'P1' | 'P2' | 'P3'
  recommendation: string
  technicalReason: string
  expectedImprovement: string
  estimatedRecoveryTime: string
  confidence: number
  risk: 'low' | 'medium' | 'high'
  rollbackPlan: string
  verification: string
}

export const mockReport = {
  brand: '10X Incident Intelligence',
  anniversary: '10th Anniversary Hackathon',
  tagline:
    'AI autonomously detected, investigated, predicted and resolved a production incident 10× faster.',
  scenario: 'Black Friday payment-service degradation',
  incidentId: 'INC-BF-10',
  generatedAt: '2025-11-28T14:00:12Z',
  mttrMinutesHuman: 47,
  mttrMinutesAi: 4.7,
  speedup: 10,
  predictionMinutesRemaining: 8,
  revenueAtRiskPerMin: 42700,
  revenueAtRiskTotal: '~$340k in 8 min window',

  executiveSummary:
    'During Black Friday ramp, payment-service saturated its Postgres connection pool (100/100). The Detection Agent spotted multi-metric degradation, the Detective Agent traced HikariCP exhaustion under 5.4× traffic, the Prediction Agent forecast checkout collapse within 10 minutes, and the Healing Agent stands ready with service-specific fixes—10× faster than historical human MTTR.',

  detection: {
    incident_created: true,
    severity: 'critical' as Severity,
    confidence: 0.92,
    reason:
      'Latency, error rate, CPU, and DB connections rose together as traffic multiplier climbed from 1.03→5.4.',
    summary:
      'CRITICAL · payment-service · Black Friday pool exhaustion · INC-BF-10 opened automatically.',
    affected_service: 'payment-service',
  },

  investigation: {
    root_cause:
      'Postgres HikariCP connection pool exhaustion on payment-service under Black Friday traffic (limit 100 saturated), causing acquire timeouts, retries, circuit-breaker OPEN, and cascading checkout failures.',
    confidence: 95,
    supporting_evidence: [
      'Metric [14:00Z]: db_connections_used=100/100 (pool fully exhausted).',
      'Metric [13:01→14:00]: RPS 1166→5746, latency 191→2418ms, errors 0.08%→28%.',
      'Log [13:54Z] ERROR PaymentController: dependency saturation, db_pool=exhausted.',
      'Log [13:54Z] WARN CircuitBreaker: payment-psp OPEN, short_circuits=226.',
      'Deploy: checkout@5.8.1 raised retries to 3 — amplified load under failure.',
      'Topology: checkout → payment → postgres is the critical path.',
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

  evidenceTimeline: [
    { t: '13:01', kind: 'metric', title: 'Baseline healthy', detail: 'RPS ~1.1k · latency 191ms · DB 30/100' },
    { t: '13:13', kind: 'metric', title: 'BF traffic ramp begins', detail: 'Traffic multiplier climbing past 1.5×' },
    { t: '13:28', kind: 'log', title: 'Pool nearing capacity', detail: 'WARN HikariCP active=71 pending_threads=9' },
    { t: '13:41', kind: 'metric', title: 'Pool pressure window', detail: 'DB connections 86+ · latency >500ms' },
    { t: '13:53', kind: 'detect', title: 'Detection Agent opens INC-BF-10', detail: 'Critical incident · confidence 92%' },
    { t: '13:54', kind: 'log', title: 'Circuit breaker OPEN', detail: 'payment-psp short_circuits=226' },
    { t: '13:54', kind: 'log', title: 'Authorize timeouts', detail: 'ERROR 504 /v1/payments/confirm latency>9s' },
    { t: '13:59', kind: 'metric', title: 'Pool exhausted', detail: 'db_connections_used=100/100' },
    { t: '14:00', kind: 'rca', title: 'Detective Agent locks root cause', detail: 'HikariCP exhaustion · confidence 95%' },
    { t: '14:01', kind: 'predict', title: 'Prediction Agent forecast', detail: 'Checkout collapse <10 minutes if unrecovered' },
  ],

  metricCorrelation: [
    { label: 'RPS', early: 1166, late: 5746, unit: '' },
    { label: 'Latency p99', early: 191, late: 2418, unit: 'ms' },
    { label: 'Error rate', early: 0.08, late: 28, unit: '%' },
    { label: 'CPU', early: 42.7, late: 96.4, unit: '%' },
    { label: 'DB pool', early: 30, late: 100, unit: '/100' },
    { label: 'Traffic ×', early: 1.03, late: 5.4, unit: '×' },
  ],

  relevantLogs: [
    {
      t: '13:54:23Z',
      level: 'ERROR',
      logger: 'PaymentController',
      msg: 'Client-facing request timeout',
      ctx: 'endpoint=/v1/payments/confirm latency_ms=9155',
    },
    {
      t: '13:54:31Z',
      level: 'WARN',
      logger: 'CircuitBreaker',
      msg: 'Circuit breaker payment-psp remains OPEN',
      ctx: 'short_circuits=226',
    },
    {
      t: '13:54:59Z',
      level: 'ERROR',
      logger: 'PaymentController',
      msg: 'Payment authorization failed due to dependency saturation',
      ctx: 'db_pool=exhausted traffic_multiplier=4.73',
    },
    {
      t: '13:57:33Z',
      level: 'ERROR',
      logger: 'KafkaProducer',
      msg: 'Failed to publish payment event after retries',
      ctx: 'topic=notification.commands',
    },
    {
      t: '13:59:41Z',
      level: 'ERROR',
      logger: 'PostgresPool',
      msg: 'Database connection pool exhausted',
      ctx: 'active=100 idle=0 waiters=198',
    },
  ],

  insights: [
    { id: 1, title: 'Pool exhaustion terminal', detail: 'DB 100/100 at 13:59–14:00Z' },
    { id: 2, title: 'Traffic 5.4× baseline', detail: 'BF ramp, not a bad deploy alone' },
    { id: 3, title: 'Latency 12×', detail: '191ms → 2418ms' },
    { id: 4, title: 'Errors 350×', detail: '0.08% → 28%' },
    { id: 5, title: 'Breaker OPEN', detail: '226 short-circuits' },
    { id: 6, title: 'Retry amplification', detail: 'Checkout retries=3' },
    { id: 7, title: 'Kafka DLQ pressure', detail: 'payment.events timeouts' },
    { id: 8, title: 'Threads 97.8%', detail: 'HTTP pool saturated' },
    { id: 9, title: '10-service blast', detail: 'Checkout path impacted' },
    { id: 10, title: '10× MTTR win', detail: '4.7m AI vs 47m human' },
  ],

  investigationSteps: [
    { step: 1, agent: 'Detection', title: 'Ingest metrics', status: 'done' as const },
    { step: 2, agent: 'Detection', title: 'Correlate anomalies', status: 'done' as const },
    { step: 3, agent: 'Detection', title: 'Create INC-BF-10', status: 'done' as const },
    { step: 4, agent: 'Detective', title: 'Gather evidence pack', status: 'done' as const },
    { step: 5, agent: 'Detective', title: 'Lock root cause', status: 'done' as const },
    { step: 6, agent: 'Impact', title: 'Map blast radius', status: 'done' as const },
    { step: 7, agent: 'Impact', title: 'Score business impact', status: 'done' as const },
    { step: 8, agent: 'Prediction', title: 'Predict outage window', status: 'done' as const },
    { step: 9, agent: 'Healing', title: 'Rank remediations', status: 'done' as const },
    { step: 10, agent: 'Healing', title: 'Arm self-heal playbook', status: 'ready' as const },
  ],

  criticalServices: [
    {
      id: 'payment',
      name: 'payment-service',
      criticality: 'critical' as Severity,
      health: 28,
      owner: 'payments-team',
      sla: 99.95,
      metrics: { rps: 5746, latency: 2418, errors: 28, cpu: 96.4, db: '100/100' },
      rootCause: 'HikariCP pool exhausted under BF load',
      downstream: ['order', 'checkout', 'notification'],
    },
    {
      id: 'checkout',
      name: 'checkout',
      criticality: 'critical' as Severity,
      health: 41,
      owner: 'checkout-team',
      sla: 99.9,
      metrics: { rps: 4200, latency: 890, errors: 19, cpu: 74, db: 'n/a' },
      rootCause: 'Upstream payment timeouts + retry storms',
      downstream: ['payment', 'fraud-detection'],
    },
    {
      id: 'api-gateway',
      name: 'api-gateway',
      criticality: 'critical' as Severity,
      health: 72,
      owner: 'platform-edge',
      sla: 99.95,
      metrics: { rps: 9100, latency: 120, errors: 4, cpu: 58, db: 'n/a' },
      rootCause: 'Elevated 5xx from checkout path',
      downstream: ['checkout'],
    },
    {
      id: 'postgres',
      name: 'postgres',
      criticality: 'critical' as Severity,
      health: 22,
      owner: 'platform-data',
      sla: 99.99,
      metrics: { rps: 0, latency: 40, errors: 0, cpu: 81, db: '100/100' },
      rootCause: 'Connection pool fully leased by payment-service',
      downstream: ['payment', 'order', 'fraud-detection'],
    },
    {
      id: 'order',
      name: 'order',
      criticality: 'critical' as Severity,
      health: 55,
      owner: 'orders-team',
      sla: 99.9,
      metrics: { rps: 1800, latency: 420, errors: 8, cpu: 61, db: '64/100' },
      rootCause: 'Payment success events delayed',
      downstream: ['notification', 'inventory'],
    },
    {
      id: 'fraud-detection',
      name: 'fraud-detection',
      criticality: 'high' as Severity,
      health: 61,
      owner: 'risk-team',
      sla: 99.9,
      metrics: { rps: 3100, latency: 210, errors: 3, cpu: 55, db: '48/100' },
      rootCause: 'Shared Postgres pressure',
      downstream: ['checkout'],
    },
    {
      id: 'inventory',
      name: 'inventory',
      criticality: 'high' as Severity,
      health: 78,
      owner: 'inventory-team',
      sla: 99.9,
      metrics: { rps: 2200, latency: 160, errors: 1, cpu: 44, db: '36/100' },
      rootCause: 'Secondary impact only',
      downstream: ['checkout'],
    },
    {
      id: 'redis',
      name: 'redis',
      criticality: 'high' as Severity,
      health: 84,
      owner: 'platform-data',
      sla: 99.95,
      metrics: { rps: 12000, latency: 4, errors: 0, cpu: 39, db: 'n/a' },
      rootCause: 'Healthy — cache hit path intact',
      downstream: [],
    },
    {
      id: 'kafka',
      name: 'kafka',
      criticality: 'high' as Severity,
      health: 66,
      owner: 'platform-streaming',
      sla: 99.9,
      metrics: { rps: 0, latency: 180, errors: 6, cpu: 52, db: 'n/a' },
      rootCause: 'Publish timeouts from payment under saturation',
      downstream: ['notification'],
    },
    {
      id: 'notification',
      name: 'notification',
      criticality: 'medium' as Severity,
      health: 80,
      owner: 'comms-team',
      sla: 99.5,
      metrics: { rps: 900, latency: 300, errors: 2, cpu: 33, db: 'n/a' },
      rootCause: 'Missing payment.events from Kafka',
      downstream: [],
    },
  ],

  businessImpactTop: [
    { label: 'Revenue / min at risk', value: '$42.7k', tone: 'critical' as const },
    { label: 'Checkout conversion', value: '−38%', tone: 'critical' as const },
    { label: 'Failed payments', value: '18.4k', tone: 'alert' as const },
    { label: 'Active shoppers hit', value: '126k', tone: 'alert' as const },
    { label: 'SLA burn', value: '14.2×', tone: 'critical' as const },
  ],

  recommendations: [
    {
      id: 'rec-1',
      rank: 1,
      targetService: 'payment-service',
      priority: 'P0' as const,
      recommendation: 'Raise HikariCP maximumPoolSize 100 → 250 and restart payment pods rolling',
      technicalReason:
        'Metrics show db_connections_used=100/100 with waiters=198; logs confirm SQLTransientConnectionException.',
      expectedImprovement: 'Eliminate pool wait timeouts; latency back under 400ms within 60s',
      estimatedRecoveryTime: '45s',
      confidence: 96,
      risk: 'medium' as const,
      rollbackPlan: 'Revert pool to 100 via config map and rolling restart',
      verification: 'db_connections_used < 70% AND latency_p99 < 400ms for 2 min',
    },
    {
      id: 'rec-2',
      rank: 2,
      targetService: 'payment-service',
      priority: 'P0' as const,
      recommendation: 'Horizontally scale payment replicas 6 → 18',
      technicalReason: 'CPU 96% and thread_pool_usage 97.8% with RPS 5.7k — single pool raise is insufficient alone.',
      expectedImprovement: 'Spread authorize load; CPU <70%; absorb BF multiplier',
      estimatedRecoveryTime: '90s',
      confidence: 93,
      risk: 'low' as const,
      rollbackPlan: 'Scale back to 6 replicas',
      verification: 'CPU < 70% AND success_rate > 98%',
    },
    {
      id: 'rec-3',
      rank: 3,
      targetService: 'checkout',
      priority: 'P0' as const,
      recommendation: 'Throttle payment retries from 3 → 1 while circuit breaker is OPEN',
      technicalReason: 'checkout@5.8.1 retry policy amplifies load during payment failures (retry storm).',
      expectedImprovement: 'Cut secondary RPS spike ~35%; stabilize payment recovery',
      estimatedRecoveryTime: '20s',
      confidence: 91,
      risk: 'low' as const,
      rollbackPlan: 'Restore maxRetries=3 feature flag',
      verification: 'checkout→payment attempt rate down; no increase in user-visible hard fails',
    },
    {
      id: 'rec-4',
      rank: 4,
      targetService: 'payment-service',
      priority: 'P1' as const,
      recommendation: 'Half-open payment-psp circuit breaker with 5% probe traffic',
      technicalReason: 'Breaker OPEN with 226 short-circuits blocks healthy recovers after pool relief.',
      expectedImprovement: 'Gradual PSP restore without thundering herd',
      estimatedRecoveryTime: '30s',
      confidence: 88,
      risk: 'medium' as const,
      rollbackPlan: 'Force OPEN again if error_rate > 10% on probes',
      verification: 'Probe success > 90% over 1 minute',
    },
    {
      id: 'rec-5',
      rank: 5,
      targetService: 'fraud-detection',
      priority: 'P1' as const,
      recommendation: 'Shed synchronous fraud checks to async for BF window',
      technicalReason: 'Fraud shares Postgres; sync path competes for remaining connections.',
      expectedImprovement: 'Free ~15–20 DB connections for payment authorize path',
      estimatedRecoveryTime: '45s',
      confidence: 84,
      risk: 'medium' as const,
      rollbackPlan: 'Re-enable sync fraud via flag',
      verification: 'payment DB waiters trending down',
    },
    {
      id: 'rec-6',
      rank: 6,
      targetService: 'kafka',
      priority: 'P2' as const,
      recommendation: 'Drain payment.events DLQ after primary path healthy',
      technicalReason: 'Publish failures accumulated; notifications lagging order confirmation.',
      expectedImprovement: 'Restore confirmation emails / push without re-pressuring payment',
      estimatedRecoveryTime: '3m',
      confidence: 80,
      risk: 'low' as const,
      rollbackPlan: 'Pause DLQ consumer',
      verification: 'DLQ lag → 0; no duplicate charge events',
    },
  ] satisfies Recommendation[],

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

  missionAgents: [
    {
      id: 'sentinel',
      name: 'Detection Agent',
      plainJob: 'Spots when something breaks',
      status: 'complete' as const,
      executionTime: '8.2s',
      confidence: 92,
      summary:
        'Noticed traffic, latency, errors, and DB usage rising together — and opened this critical incident.',
    },
    {
      id: 'investigator',
      name: 'Detective Agent',
      plainJob: 'Finds the root cause',
      status: 'complete' as const,
      executionTime: '32.4s',
      confidence: 95,
      summary:
        'Followed metrics, logs, and deploys like clues. Root cause: connection pool ran out under Black Friday load.',
    },
    {
      id: 'navigator',
      name: 'Impact Agent',
      plainJob: 'Shows what else is hurt',
      status: 'complete' as const,
      executionTime: '11.0s',
      confidence: 90,
      summary:
        'Mapped the blast radius across 10 services. Checkout and order are the most at risk downstream.',
    },
    {
      id: 'oracle',
      name: 'Prediction Agent',
      plainJob: 'Forecasts what happens next',
      status: 'complete' as const,
      executionTime: '14.6s',
      confidence: 89,
      summary:
        'Estimates ~$42.7k/min at risk and checkout may fully collapse in about 8–10 minutes if unrecovered.',
    },
    {
      id: 'healer',
      name: 'Healing Agent',
      plainJob: 'Proposes how to fix it',
      status: 'armed' as const,
      executionTime: '9.1s',
      confidence: 94,
      summary:
        'Ranked 6 safe fix actions with rollback checks. Ready to run when you hit execute on Self-Healing.',
    },
  ],

  liveFeed: [
    { t: '14:00:12', level: 'critical', msg: 'INC-BF-10 opened — payment pool exhausted' },
    { t: '14:00:18', level: 'warn', msg: 'Detection Agent confidence 92% — multi-metric correlation' },
    { t: '14:00:41', level: 'info', msg: 'Detective Agent root cause: HikariCP exhaustion' },
    { t: '14:01:02', level: 'warn', msg: 'Prediction Agent: checkout collapse in <10 minutes' },
    { t: '14:01:40', level: 'info', msg: 'Healing Agent published P0 remediations' },
    { t: '14:02:10', level: 'info', msg: 'Self-heal playbook armed — awaiting execute' },
  ],
}

/** Mission Control report (mock baseline or API-merged). */
export type ReportData = typeof mockReport
export type MockReport = ReportData
export type CriticalService = ReportData['criticalServices'][number]
