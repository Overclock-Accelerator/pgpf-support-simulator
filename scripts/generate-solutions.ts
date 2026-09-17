/**
 * Generates lib/preloaded-solutions.ts.
 *
 * Replays the 13 BASE_CASE_HISTORY user turns against each of the 6
 * SAMPLE_CONFIGS using the exact same provider routing, system prompt, and
 * context resolution as /api/chat (lib/chat-providers.ts). The Solution view
 * then loads these transcripts locally — zero /api/chat calls at demo time.
 *
 * Usage:
 *   npm run generate-solutions
 *
 * Keys (read from .env.local, then the environment):
 *   ANTHROPIC_API_KEY  — direct Anthropic models (2 configs)
 *   OPENAI_API_KEY     — direct OpenAI models (1 config)
 *   OPENROUTER_API_KEY — OpenRouter models (3 configs: qwen ×2, deepseek)
 *
 * If OPENROUTER_API_KEY is not available, OpenRouter-model configs can
 * instead be replayed through a deployed simulator instance (which holds the
 * key server-side) by setting:
 *   SOLUTIONS_REMOTE_CHAT_URL=https://<your-deploy>.vercel.app/api/chat
 *
 * ~78 small calls total, sequential, one-time. Approx cost: $0.10–$0.30
 * depending on the OpenRouter models' current pricing.
 */

import { writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { config as loadEnv } from 'dotenv'

import { BASE_CASE_HISTORY } from '../lib/base-case'
import { resolveContextForRequest } from '../lib/company-context'
import { SAMPLE_CONFIGS } from '../lib/sample-configs'
import type { PreloadedMessage, PreloadedSolution } from '../lib/preloaded-solutions'
import {
  buildFullSystemPrompt,
  callModel,
  getProvider,
  type ChatMessage,
} from '../lib/chat-providers'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
loadEnv({ path: [join(ROOT, '.env.local'), join(ROOT, '.env')], quiet: true })

const REMOTE_CHAT_URL = process.env.SOLUTIONS_REMOTE_CHAT_URL
const POLITE_DELAY_MS = 300
const MAX_RETRIES = 3

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function callRemoteChat(
  modelId: string,
  systemPrompt: string,
  messages: ChatMessage[]
): Promise<{ content: string; latencyMs: number; costUsd: number }> {
  const res = await fetch(REMOTE_CHAT_URL!, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages, systemPrompt, modelId }),
  })
  if (!res.ok) {
    throw new Error(`Remote chat ${res.status}: ${(await res.text()).slice(0, 200)}`)
  }
  return res.json()
}

/** One assistant turn via /api/chat-equivalent routing, with retry/backoff. */
async function callTurn(
  modelId: string,
  fullSystem: string,
  history: ChatMessage[]
): Promise<{ content: string; latencyMs: number; costUsd: number }> {
  const provider = getProvider(modelId)
  const needsOpenRouter = provider !== 'anthropic' && provider !== 'openai'

  let lastErr: unknown
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      if (needsOpenRouter && !process.env.OPENROUTER_API_KEY) {
        if (!REMOTE_CHAT_URL) {
          throw new Error(
            `OPENROUTER_API_KEY is not set and SOLUTIONS_REMOTE_CHAT_URL is not configured — ` +
            `cannot generate transcript for OpenRouter model ${modelId}`
          )
        }
        return await callRemoteChat(modelId, fullSystem, history)
      }
      const start = Date.now()
      const { content, costUsd } = await callModel(modelId, fullSystem, history)
      return { content, latencyMs: Date.now() - start, costUsd }
    } catch (err) {
      lastErr = err
      console.warn(`  attempt ${attempt}/${MAX_RETRIES} failed: ${String(err).slice(0, 160)}`)
      await sleep(1000 * attempt)
    }
  }
  throw lastErr
}

async function generateForConfig(configId: string, modelId: string, systemPrompt: string) {
  const contextDoc = resolveContextForRequest(undefined)
  const fullSystem = buildFullSystemPrompt(systemPrompt, contextDoc)
  const userTurns = BASE_CASE_HISTORY.filter((m) => m.role === 'user')

  const messages: PreloadedMessage[] = []
  const history: ChatMessage[] = []

  for (const [i, turn] of userTurns.entries()) {
    // Include the current user turn in the request, matching how
    // /api/chat is called from the UI (and the original live autopopulate).
    history.push({ role: 'user', content: turn.content })
    const { content, latencyMs, costUsd } = await callTurn(modelId, fullSystem, history)
    messages.push({ role: 'user', content: turn.content, latencyMs: 0, costUsd: 0 })
    messages.push({ role: 'assistant', content, latencyMs, costUsd })
    history.push({ role: 'assistant', content })
    console.log(`  turn ${i + 1}/${userTurns.length} ok (${latencyMs}ms, $${costUsd.toFixed(4)})`)
    await sleep(POLITE_DELAY_MS)
  }

  return { configId, messages } satisfies PreloadedSolution
}

function verifyConfiguredKeys() {
  const warnings: string[] = []
  const anthropicNeeded = SAMPLE_CONFIGS.some((c) => getProvider(c.modelId) === 'anthropic')
  const openaiNeeded = SAMPLE_CONFIGS.some((c) => getProvider(c.modelId) === 'openai')
  const openrouterNeeded = SAMPLE_CONFIGS.some((c) => {
    const p = getProvider(c.modelId)
    return p !== 'anthropic' && p !== 'openai'
  })
  if (anthropicNeeded && !process.env.ANTHROPIC_API_KEY) warnings.push('ANTHROPIC_API_KEY missing')
  if (openaiNeeded && !process.env.OPENAI_API_KEY) warnings.push('OPENAI_API_KEY missing')
  if (openrouterNeeded && !process.env.OPENROUTER_API_KEY && !REMOTE_CHAT_URL) {
    warnings.push('OPENROUTER_API_KEY missing and SOLUTIONS_REMOTE_CHAT_URL unset')
  }
  return warnings
}

async function main() {
  console.log(`Generating preloaded solutions for ${SAMPLE_CONFIGS.length} configs...`)
  for (const w of verifyConfiguredKeys()) console.warn(`WARNING: ${w}`)

  const solutions: PreloadedSolution[] = []
  for (const config of SAMPLE_CONFIGS) {
    console.log(`\n[${config.id}] ${config.name} — ${config.modelId}`)
    solutions.push(await generateForConfig(config.id, config.modelId, config.systemPrompt))
  }

  const outPath = join(ROOT, 'lib', 'preloaded-solutions.ts')
  const header = `/**
 * GENERATED FILE — do not edit by hand.
 *
 * Regenerate with \`npm run generate-solutions\` (requires provider API keys;
 * ~78 small LLM calls, one-time, roughly $0.10–$0.30).
 *
 * Captured from a real generation run on ${new Date().toISOString().slice(0, 10)}
 * using the same provider routing as /api/chat.
 */
`
  const body = `export interface PreloadedMessage {
  role: 'user' | 'assistant'
  content: string
  /** Generation-time latency for assistant messages; 0 for user messages. */
  latencyMs: number
  /** Generation-time cost for assistant messages; 0 for user messages. */
  costUsd: number
}

export interface PreloadedSolution {
  /** Matches SampleConfig.id in lib/sample-configs.ts */
  configId: string
  /** Full interleaved transcript: 13 user turns + 13 assistant replies. */
  messages: PreloadedMessage[]
}

export const PRELOADED_SOLUTIONS: PreloadedSolution[] = ${JSON.stringify(solutions, null, 2)}
`
  writeFileSync(outPath, header + body)
  const totalCost = solutions.reduce(
    (sum, s) => sum + s.messages.reduce((a, m) => a + m.costUsd, 0),
    0
  )
  console.log(`\nWrote ${outPath}`)
  console.log(`Total generation cost: $${totalCost.toFixed(4)}`)
}

main().catch((err) => {
  console.error('generate-solutions failed:', err)
  process.exit(1)
})
