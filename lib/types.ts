export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  latencyMs?: number
  costUsd?: number
  timestamp: number
  /** Base case: hover “coach” note for facilitators */
  coachHint?: string
}

export interface Tab {
  id: string
  name: string
  systemPrompt: string
  modelId: string
  messages: Message[]
  isBaseCase: boolean
  /** Read-only exercise brief; not chat, not configurable */
  isInstructions?: boolean
  /** Variation tabs: custom company context; omitted or blank uses default catalog */
  companyContext?: string
}
