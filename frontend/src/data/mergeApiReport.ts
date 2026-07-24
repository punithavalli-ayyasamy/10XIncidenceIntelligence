import type { ApiIncidentReport, ApiSeverity } from '@/api/types'
import { mockReport, type ReportData, type Severity } from '@/data/mockReport'

function asSeverity(value: ApiSeverity | null | undefined, fallback: Severity): Severity {
  const v = (value ?? fallback).toLowerCase()
  if (v === 'critical' || v === 'high' || v === 'medium' || v === 'low') return v
  return fallback
}

function cloneBase(): ReportData {
  return structuredClone(mockReport) as ReportData
}

/**
 * Overlay live Detection + Investigation API fields onto the Mission Control
 * storyboard (topology, remediations, prediction remain demo-enriched).
 */
export function mergeApiReport(api: ApiIncidentReport): ReportData {
  const base = cloneBase()
  const detection = api.detection
  const investigation = api.investigation
  const incident = api.incident

  const severity = asSeverity(
    detection?.severity ?? api.severity ?? incident?.severity,
    base.detection.severity,
  )

  const detConfidence =
    typeof detection?.confidence === 'number' ? detection.confidence : base.detection.confidence

  const rcaConfidence =
    typeof investigation?.confidence === 'number'
      ? investigation.confidence
      : typeof api.confidence === 'number'
        ? api.confidence <= 1
          ? Math.round(api.confidence * 100)
          : Math.round(api.confidence)
        : base.investigation.confidence

  const rootCause =
    investigation?.root_cause ?? api.root_cause ?? base.investigation.root_cause

  const evidence =
    investigation?.supporting_evidence?.length
      ? investigation.supporting_evidence
      : api.supporting_evidence?.length
        ? api.supporting_evidence
        : base.investigation.supporting_evidence

  const affected =
    investigation?.affected_services?.length
      ? investigation.affected_services
      : api.affected_services?.length
        ? api.affected_services
        : base.investigation.affected_services

  const incidentId = incident?.id ?? base.incidentId

  base.incidentId = incidentId
  base.generatedAt = api.generated_at ?? base.generatedAt
  base.executiveSummary = api.summary || base.executiveSummary

  base.detection = {
    incident_created: detection?.incident_created ?? true,
    severity,
    confidence: detConfidence,
    reason: detection?.reason ?? base.detection.reason,
    summary: detection?.summary ?? base.detection.summary,
    affected_service: detection?.affected_service ?? api.service ?? base.detection.affected_service,
  }

  base.investigation = {
    root_cause: rootCause,
    confidence: rcaConfidence,
    supporting_evidence: evidence,
    affected_services: affected,
  }

  // Enrich agent cards with live confidence / summaries when available
  base.missionAgents = base.missionAgents.map((agent) => {
    if (agent.id === 'sentinel' && detection) {
      return {
        ...agent,
        status: 'complete' as const,
        confidence: Math.round(detConfidence * 100),
        summary: detection.summary || agent.summary,
      }
    }
    if (agent.id === 'investigator' && investigation) {
      return {
        ...agent,
        status: 'complete' as const,
        confidence: rcaConfidence,
        summary: rootCause.slice(0, 180) || agent.summary,
      }
    }
    return agent
  })

  // Pipeline steps from API traces when present
  if (api.step_traces?.length) {
    base.investigationSteps = api.step_traces.map((trace, i) => ({
      step: i + 1,
      agent: humanAgentName(trace.agent),
      title: trace.reason || trace.status,
      status: (trace.status === 'ran' || trace.status === 'complete' ? 'done' : 'ready') as
        | 'done'
        | 'ready',
    }))
  }

  // Live feed from API
  const feed: ReportData['liveFeed'] = [
    {
      t: new Date(api.generated_at || Date.now()).toISOString().slice(11, 19),
      level: 'info' as const,
      msg: `Report ${api.report_id} · ${api.status}`,
    },
  ]
  if (detection) {
    feed.push({
      t: 'api',
      level: severity === 'critical' ? 'critical' : 'warn',
      msg: `Detection · ${Math.round(detConfidence * 100)}% · ${detection.summary}`,
    })
  }
  if (investigation) {
    feed.push({
      t: 'api',
      level: 'info',
      msg: `Detective · RCA ${rcaConfidence}% · ${rootCause.slice(0, 120)}`,
    })
  }
  base.liveFeed = [...feed, ...base.liveFeed].slice(0, 8)

  return base
}

function humanAgentName(raw: string): string {
  const key = raw.toLowerCase()
  if (key.includes('detect')) return 'Detection'
  if (key.includes('investig')) return 'Detective'
  if (key.includes('impact') || key.includes('navig')) return 'Impact'
  if (key.includes('predict') || key.includes('oracle')) return 'Prediction'
  if (key.includes('heal') || key.includes('remed')) return 'Healing'
  return raw
}
