export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  latencyMs?: number
  costUsd?: number
  timestamp: number
  /** Base case: hover "coach" note for facilitators */
  coachHint?: string
  /** Base case: short headline summarising the failure (shown in popout header) */
  coachHeadline?: string
  /** Base case: cost / speed / brevity teaching note */
  perfHint?: string
  /** Base case: short headline for the perf note */
  perfHeadline?: string
}

export interface Tab {
  id: string
  name: string
  systemPrompt: string
  modelId: string
  messages: Message[]
  isBaseCase: boolean
  /** Variation tabs: custom company context; omitted or blank uses default catalog */
  companyContext?: string
}
