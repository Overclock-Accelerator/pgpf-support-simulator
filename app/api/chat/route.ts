import { NextRequest } from 'next/server'
import { resolveContextForRequest } from '@/lib/company-context'
import { buildFullSystemPrompt, callModel } from '@/lib/chat-providers'

export async function POST(req: NextRequest) {
  const { messages, systemPrompt, modelId, companyContext } = await req.json()
  const contextDoc = resolveContextForRequest(
    typeof companyContext === 'string' ? companyContext : undefined
  )

  const fullSystem = buildFullSystemPrompt(systemPrompt, contextDoc)

  const startTime = Date.now()
  try {
    const { content, costUsd } = await callModel(modelId, fullSystem, messages)
    const latencyMs = Date.now() - startTime
    return Response.json({ content, latencyMs, costUsd })
  } catch (err) {
    console.error('Chat provider error:', err)
    const latencyMs = Date.now() - startTime
    return Response.json({
      content: 'Sorry, something went wrong. Please try again.',
      latencyMs,
      costUsd: 0,
    })
  }
}
