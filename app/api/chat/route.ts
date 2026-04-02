import { NextRequest } from 'next/server'
import { resolveContextForRequest } from '@/lib/company-context'

export async function POST(req: NextRequest) {
  const { messages, systemPrompt, modelId, companyContext } = await req.json()
  const contextDoc = resolveContextForRequest(
    typeof companyContext === 'string' ? companyContext : undefined
  )

  const fullSystem = `${systemPrompt}\n\n---\nCOMPANY CONTEXT DOCUMENT (use this to answer customer questions accurately):\n${contextDoc}`

  const startTime = Date.now()

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
        { role: 'system', content: fullSystem },
        ...messages.map((m: { role: string; content: string }) => ({ role: m.role, content: m.content }))
      ],
    }),
  })

  const data = await res.json()
  const latencyMs = Date.now() - startTime
  const content = data.choices?.[0]?.message?.content ?? 'Sorry, something went wrong. Please try again.'
  const usage = data.usage ?? {}
  const costUsd = ((usage.prompt_tokens ?? 0) * 0.000001) + ((usage.completion_tokens ?? 0) * 0.000002)

  return Response.json({ content, latencyMs, costUsd })
}
