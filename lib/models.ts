export interface Model {
  id: string
  name: string
  provider: string
  tier: 'fast' | 'balanced' | 'premium'
  description: string
  /** Input-token price per 1M tokens (USD), Sept-2026 provider pricing. */
  pricePer1M: number
}

export const MODELS: Model[] = [
  // Anthropic (direct)
  { id: 'anthropic/claude-haiku-4-5',  name: 'Claude Haiku 4.5',  provider: 'Anthropic',   tier: 'fast',     description: 'Fast & efficient',      pricePer1M: 1.00  },
  { id: 'anthropic/claude-sonnet-5',   name: 'Claude Sonnet 5',   provider: 'Anthropic',   tier: 'balanced', description: 'Balanced',              pricePer1M: 2.00  },
  { id: 'anthropic/claude-opus-5',     name: 'Claude Opus 5',     provider: 'Anthropic',   tier: 'premium',  description: 'Most capable',          pricePer1M: 5.00  },
  // OpenAI (direct)
  { id: 'openai/gpt-5.6-luna',         name: 'GPT-5.6 Luna',      provider: 'OpenAI',      tier: 'fast',     description: 'Fast & cheap',          pricePer1M: 0.20  },
  { id: 'openai/gpt-5.6-terra',        name: 'GPT-5.6 Terra',     provider: 'OpenAI',      tier: 'balanced', description: 'Balanced',              pricePer1M: 2.00  },
  { id: 'openai/gpt-5.6-sol',          name: 'GPT-5.6 Sol',       provider: 'OpenAI',      tier: 'premium',  description: 'GPT-5.6 flagship',      pricePer1M: 4.00  },
  // Chinese / Open Source (via OpenRouter)
  { id: 'deepseek/deepseek-v3.2',      name: 'DeepSeek V3.2',     provider: 'DeepSeek',    tier: 'balanced', description: 'Chinese open-source',   pricePer1M: 0.26  },
  { id: 'qwen/qwen3.5-flash-02-23',    name: 'Qwen 3.5 Flash',    provider: 'Qwen',        tier: 'fast',     description: 'Chinese open-source',   pricePer1M: 0.065 },
  { id: 'z-ai/glm-4.7-flash',          name: 'GLM-4.7 Flash',     provider: 'z.ai',        tier: 'fast',     description: 'Chinese open-source',   pricePer1M: 0.06  },
  { id: 'moonshotai/kimi-k2.5',        name: 'Kimi K2.5',         provider: 'Moonshot AI', tier: 'balanced', description: 'Chinese closed-source', pricePer1M: 0.40  },
  // Others (via OpenRouter)
  { id: 'x-ai/grok-4.1-fast',          name: 'Grok 4.1 Fast',     provider: 'xAI',         tier: 'fast',     description: 'xAI fast model',        pricePer1M: 0.20  },
  { id: 'minimax/minimax-m2.5',        name: 'MiniMax M2.5',      provider: 'MiniMax',     tier: 'balanced', description: 'Chinese multimodal',    pricePer1M: 0.12  },
]

export const PROVIDER_ORDER = ['Anthropic', 'OpenAI', 'DeepSeek', 'Qwen', 'z.ai', 'Moonshot AI', 'xAI', 'MiniMax']
export const BASE_CASE_MODEL_ID = 'anthropic/claude-opus-5'

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
