export interface Model {
  id: string
  name: string
  provider: string
  tier: 'fast' | 'balanced' | 'premium'
  description: string
  pricePer1M: number
}

export const MODELS: Model[] = [
  // Anthropic
  { id: 'anthropic/claude-haiku-4.5',   name: 'Claude Haiku 4.5',  provider: 'Anthropic',   tier: 'fast',     description: 'Fast & efficient',    pricePer1M: 1.00  },
  { id: 'anthropic/claude-sonnet-4.6',  name: 'Claude Sonnet 4.6', provider: 'Anthropic',   tier: 'balanced', description: 'Balanced',             pricePer1M: 3.00  },
  { id: 'anthropic/claude-opus-4.6',    name: 'Claude Opus 4.6',   provider: 'Anthropic',   tier: 'premium',  description: 'Most capable',         pricePer1M: 5.00  },
  // OpenAI
  { id: 'openai/gpt-5.4-nano',          name: 'GPT-5.4 Nano',      provider: 'OpenAI',      tier: 'fast',     description: 'Fast & cheap',         pricePer1M: 0.20  },
  { id: 'openai/gpt-5.4-mini',          name: 'GPT-5.4 Mini',      provider: 'OpenAI',      tier: 'fast',     description: 'Balanced speed',       pricePer1M: 0.75  },
  { id: 'openai/gpt-5.4',               name: 'GPT-5.4',           provider: 'OpenAI',      tier: 'balanced', description: 'Flagship',             pricePer1M: 2.50  },
  // Chinese / Open Source
  { id: 'deepseek/deepseek-v3.2',       name: 'DeepSeek V3.2',     provider: 'DeepSeek',    tier: 'balanced', description: 'Chinese open-source',  pricePer1M: 0.26  },
  { id: 'qwen/qwen3.5-flash-02-23',     name: 'Qwen 3.5 Flash',    provider: 'Qwen',        tier: 'fast',     description: 'Chinese open-source',  pricePer1M: 0.065 },
  { id: 'z-ai/glm-4.7-flash',           name: 'GLM-4.7 Flash',     provider: 'z.ai',        tier: 'fast',     description: 'Chinese open-source',  pricePer1M: 0.06  },
  { id: 'moonshotai/kimi-k2.5',         name: 'Kimi K2.5',         provider: 'Moonshot AI', tier: 'balanced', description: 'Chinese closed-source', pricePer1M: 0.40  },
  // Others
  { id: 'x-ai/grok-4.1-fast',           name: 'Grok 4.1 Fast',     provider: 'xAI',         tier: 'fast',     description: 'xAI fast model',       pricePer1M: 0.20  },
  { id: 'minimax/minimax-m2.5',         name: 'MiniMax M2.5',      provider: 'MiniMax',     tier: 'balanced', description: 'Chinese multimodal',   pricePer1M: 0.12  },
]

export const PROVIDER_ORDER = ['Anthropic', 'OpenAI', 'DeepSeek', 'Qwen', 'z.ai', 'Moonshot AI', 'xAI', 'MiniMax']
export const BASE_CASE_MODEL_ID = 'anthropic/claude-haiku-4.5'

export function getModel(id: string): Model | undefined {
  return MODELS.find(m => m.id === id)
}

export function formatPrice(pricePer1M: number): string {
  if (pricePer1M < 0.10) return '$' + pricePer1M.toFixed(3) + '/1M'
  return '$' + pricePer1M.toFixed(2) + '/1M'
}

export function getPriceColor(pricePer1M: number): string {
  if (pricePer1M <= 0.20) return 'text-green-600'
  if (pricePer1M <= 1.00) return 'text-amber-600'
  return 'text-red-500'
}
