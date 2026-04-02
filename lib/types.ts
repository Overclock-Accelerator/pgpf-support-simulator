export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  latencyMs?: number
  costUsd?: number
  timestamp: number
}

export interface Tab {
  id: string
  name: string
  systemPrompt: string
  modelId: string
  messages: Message[]
  isBaseCase: boolean
}
