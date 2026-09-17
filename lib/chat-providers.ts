/**
 * Shared LLM provider calling logic.
 *
 * Used by `app/api/chat/route.ts` (live chat) and
 * `scripts/generate-solutions.ts` (preloaded solution transcripts), so both
 * paths resolve models, system prompts, and context identically.
 *
 * All callers throw on provider/API errors; the API route catches and
 * returns a graceful fallback, while the generation script fails loudly
 * (a transcript must never silently contain an error placeholder).
 */

export type ChatMessage = { role: string; content: string }

export function getProvider(modelId: string): string {
  return modelId.split('/')[0]
}

export function getModelName(modelId: string): string {
  return modelId.split('/').slice(1).join('/')
}

// Maps UI model names (dot-notation) to actual API model IDs.
// Sept-2026 roster — IDs verified against the live Anthropic /v1/models and
// OpenAI /v1/models endpoints. Identity mappings are intentional: they pin the
// exact API ID while keeping the UI label decoupled.
export const ANTHROPIC_MODEL_MAP: Record<string, string> = {
  'claude-haiku-4-5':  'claude-haiku-4-5',
  'claude-sonnet-5':   'claude-sonnet-5',
  'claude-opus-5':     'claude-opus-5',
  'claude-fable-5-1':  'claude-fable-5-1',
}

export const OPENAI_MODEL_MAP: Record<string, string> = {
  'gpt-5.6-luna':  'gpt-5.6-luna',
  'gpt-5.6-terra': 'gpt-5.6-terra',
  'gpt-5.6-sol':   'gpt-5.6-sol',
  'gpt-6-astra':   'gpt-6-astra',
}

export async function callAnthropic(modelName: string, systemPrompt: string, messages: ChatMessage[]) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': process.env.ANTHROPIC_API_KEY!,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: modelName,
      // 2048 leaves room for thinking blocks on extended-thinking models
      // (e.g. claude-opus-5) plus the visible reply within one call.
      max_tokens: 2048,
      system: systemPrompt,
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
    }),
  })
  const data = await res.json()
  if (!res.ok) {
    throw new Error(`Anthropic ${res.status}: ${JSON.stringify(data).slice(0, 300)}`)
  }
  // Thinking models return content blocks like [{type:'thinking'}, {type:'text'}]
  // — the text block is not guaranteed to be first.
  const text = (Array.isArray(data.content) ? data.content : [])
    .filter((b: { type?: string }) => b.type === 'text')
    .map((b: { text?: string }) => b.text ?? '')
    .join('')
  if (!text) {
    throw new Error(`Anthropic returned no text block: ${JSON.stringify(data).slice(0, 300)}`)
  }
  const usage = data.usage ?? {}
  const costUsd = ((usage.input_tokens ?? 0) * 0.000001) + ((usage.output_tokens ?? 0) * 0.000002)
  return { content: text, costUsd }
}

export async function callOpenAI(modelName: string, systemPrompt: string, messages: ChatMessage[]) {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: modelName,
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages.map((m) => ({ role: m.role, content: m.content })),
      ],
    }),
  })
  const data = await res.json()
  if (!res.ok) {
    throw new Error(`OpenAI ${res.status}: ${JSON.stringify(data).slice(0, 300)}`)
  }
  const content = data.choices?.[0]?.message?.content
  if (!content) {
    throw new Error(`OpenAI returned no content: ${JSON.stringify(data).slice(0, 300)}`)
  }
  const usage = data.usage ?? {}
  const costUsd = ((usage.prompt_tokens ?? 0) * 0.000001) + ((usage.completion_tokens ?? 0) * 0.000002)
  return { content, costUsd }
}

export async function callOpenRouter(modelId: string, systemPrompt: string, messages: ChatMessage[]) {
  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://prettygoodpetfoods-simulator.vercel.app',
      'X-Title': 'PrettyGoodPetFoods Support Simulator',
    },
    body: JSON.stringify({
      model: modelId,
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages.map((m) => ({ role: m.role, content: m.content })),
      ],
    }),
  })
  const data = await res.json()
  if (!res.ok) {
    throw new Error(`OpenRouter ${res.status}: ${JSON.stringify(data).slice(0, 300)}`)
  }
  const content = data.choices?.[0]?.message?.content
  if (!content) {
    throw new Error(`OpenRouter returned no content: ${JSON.stringify(data).slice(0, 300)}`)
  }
  const usage = data.usage ?? {}
  const costUsd = ((usage.prompt_tokens ?? 0) * 0.000001) + ((usage.completion_tokens ?? 0) * 0.000002)
  return { content, costUsd }
}

/** System prompt + company context document, exactly as /api/chat sends it. */
export function buildFullSystemPrompt(systemPrompt: string, contextDoc: string): string {
  return `${systemPrompt}\n\n---\nCOMPANY CONTEXT DOCUMENT (use this to answer customer questions accurately):\n${contextDoc}`
}

/** Routes a modelId to the right provider, mirroring /api/chat exactly. */
export async function callModel(
  modelId: string,
  fullSystemPrompt: string,
  messages: ChatMessage[]
): Promise<{ content: string; costUsd: number }> {
  const provider = getProvider(modelId)
  const modelName = getModelName(modelId)

  if (provider === 'anthropic') {
    return callAnthropic(ANTHROPIC_MODEL_MAP[modelName] ?? modelName, fullSystemPrompt, messages)
  }
  if (provider === 'openai') {
    return callOpenAI(OPENAI_MODEL_MAP[modelName] ?? modelName, fullSystemPrompt, messages)
  }
  return callOpenRouter(modelId, fullSystemPrompt, messages)
}
