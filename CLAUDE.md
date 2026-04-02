@AGENTS.md

# PrettyGoodPetFoods Support Simulator

## What This Is

An educational simulator built for the **Overclock AI Operations Accelerator** program (Unit 1: "Beyond ChatGPT: Navigating the AI Tool Landscape"). Students use it during a ~20-minute breakout activity to learn how system prompts, model selection, and context injection affect AI behavior.

## The Exercise

Students are told PrettyGoodPetFoods' customer support bot has been deployed to production and is failing badly. A locked **Base Case** tab shows 8 pre-loaded conversations demonstrating real failure modes: hallucinated pricing, wrong product recommendations, invented policies, competitor endorsement, off-topic responses, and ignored pet health emergencies.

Students open new tabs and iterate on two levers:
1. **System prompt** — rewrite the bot's instructions (tone, guardrails, context injection, conditional logic)
2. **Model selection** — switch between 12 models across Anthropic, OpenAI, DeepSeek, Qwen, xAI, and others at wildly different price points ($0.06 to $5.00 per 1M tokens)

A read-only **company context document** (product catalog, pricing, return policy) is pre-loaded into every conversation. Students cannot change it — the point is to learn that the model only knows what you tell it.

## Learning Objectives

- **System prompt = operating contract.** The difference between a general-purpose LLM and a purpose-built agent.
- **Context injection is the simplest unlock.** If the bot doesn't know your business, it will invent one.
- **Guardrails are explicit, not implied.** "Be helpful" does not mean "don't recommend competitor products."
- **Model and prompt are independent levers.** A better model makes a bad prompt less bad. A better prompt makes a cheap model significantly better.
- **The application layer is what makes AI useful.** The underlying model didn't change — only the layer around it.

## Key Design Decisions

- The fictional company (PrettyGoodPetFoods) was chosen because pet food covers a rich range of support scenarios while being light enough to be fun.
- The return policy is deliberately unusual (store credit + "disgusted face photo" proof) to test whether students inject it into context.
- The base case system prompt is deliberately weak ("You are a helpful assistant. Be polite and answer questions.") so failures are obvious.
- Password-gated (`OpsFTW`) since it's for cohort use only.
- Chat API routes through OpenRouter to support multi-provider model selection.

## Tech Stack

Next.js 16 (Turbopack), React 19, Tailwind CSS 4, shadcn/ui. Deployed on Vercel.
