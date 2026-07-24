/** API types matching backend IncidentIntelligenceReport (subset used by UI). */

export type ApiSeverity = 'critical' | 'high' | 'medium' | 'low' | string

export type ApiDetection = {
  incident_created: boolean
  severity: ApiSeverity
  confidence: number
  reason: string
  summary: string
  affected_service: string
  next_agent?: string
}

export type ApiInvestigation = {
  root_cause: string
  confidence: number
  supporting_evidence: string[]
  affected_services: string[]
}

export type ApiIncident = {
  id: string
  title: string
  service: string
  severity: ApiSeverity
  status: string
  detected_at?: string | null
  description?: string | null
}

export type ApiStepTrace = {
  agent: string
  status: string
  reason?: string | null
  output_keys?: string[]
}

export type ApiIncidentReport = {
  report_id: string
  status: string
  generated_at: string
  service?: string | null
  incident?: ApiIncident | null
  detection?: ApiDetection | null
  investigation?: ApiInvestigation | null
  summary: string
  severity?: string | null
  root_cause?: string | null
  confidence?: number | null
  supporting_evidence?: string[]
  affected_services?: string[]
  pipeline?: string[]
  agents_run?: string[]
  step_traces?: ApiStepTrace[]
  next_agent?: string | null
}
