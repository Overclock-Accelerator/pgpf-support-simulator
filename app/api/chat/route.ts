import { NextRequest } from 'next/server'
import { resolveContextForRequest } from '@/lib/company-context'

type ChatMessage = { role: string; content: string }

function getProvider(modelId: string): string {
  return modelId.split('/')[0]
}

function getModelName(modelId: string): string {
  return modelId.split('/').slice(1).join('/')
}

// Maps UI model names (dot-notation) to actual API model IDs
const ANTHROPIC_MODEL_MAP: Record<string, string> = {
  'claude-haiku-4.5':  'claude-haiku-4-5-20251001',
  'claude-sonnet-4.6': 'claude-sonnet-4-6',
  'claude-opus-4.6':   'claude-opus-4-6',
}

const OPENAI_MODEL_MAP: Record<string, string> = {
  'gpt-5.4-nano': 'gpt-4o-mini',
  'gpt-5.4-mini': 'gpt-4o-mini',
  'gpt-5.4':      'gpt-4o',
}

async function callAnthropic(modelName: string, systemPrompt: string, messages: ChatMessage[]) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': process.env.ANTHROPIC_API_KEY!,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: modelName,
      max_tokens: 1024,
      system: systemPrompt,
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
    }),
  })
  const data = await res.json()
  const content = data.content?.[0]?.text ?? 'Sorry, something went wrong. Please try again.'
  const usage = data.usage ?? {}
  const costUsd = ((usage.input_tokens ?? 0) * 0.000001) + ((usage.output_tokens ?? 0) * 0.000002)
  return { content, costUsd }
}

async function callOpenAI(modelName: string, systemPrompt: string, messages: ChatMessage[]) {
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
  const content = data.choices?.[0]?.message?.content ?? 'Sorry, something went wrong. Please try again.'
  const usage = data.usage ?? {}
  const costUsd = ((usage.prompt_tokens ?? 0) * 0.000001) + ((usage.completion_tokens ?? 0) * 0.000002)
  return { content, costUsd }
}

async function callOpenRouter(modelId: string, systemPrompt: string, messages: ChatMessage[]) {
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
  const content = data.choices?.[0]?.message?.content ?? 'Sorry, something went wrong. Please try again.'
  const usage = data.usage ?? {}
  const costUsd = ((usage.prompt_tokens ?? 0) * 0.000001) + ((usage.completion_tokens ?? 0) * 0.000002)
  return { content, costUsd }
}

export async function POST(req: NextRequest) {
  const { messages, systemPrompt, modelId, companyContext } = await req.json()
  const contextDoc = resolveContextForRequest(
    typeof companyContext === 'string' ? companyContext : undefined
  )

  const fullSystem = `${systemPrompt}\n\n---\nCOMPANY CONTEXT DOCUMENT (use this to answer customer questions accurately):\n${contextDoc}`

  const startTime = Date.now()
  const provider = getProvider(modelId)
  const modelName = getModelName(modelId)

  let content: string
  let costUsd: number

  if (provider === 'anthropic') {
    const resolvedModel = ANTHROPIC_MODEL_MAP[modelName] ?? modelName
    ;({ content, costUsd } = await callAnthropic(resolvedModel, fullSystem, messages))
  } else if (provider === 'openai') {
    const resolvedModel = OPENAI_MODEL_MAP[modelName] ?? modelName
    ;({ content, costUsd } = await callOpenAI(resolvedModel, fullSystem, messages))
  } else {
    ;({ content, costUsd } = await callOpenRouter(modelId, fullSystem, messages))
  }

  const latencyMs = Date.now() - startTime
  return Response.json({ content, latencyMs, costUsd })
}
