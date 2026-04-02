# PrettyGoodPetFoods Support Simulator

An educational breakout activity for the **[Overclock AI Operations Accelerator](https://overclockaccelerator.com)** — Unit 1: "Beyond ChatGPT: Navigating the AI Tool Landscape."

**Live:** https://pgpf-support-simulator.vercel.app &middot; **Password:** `Overclock`

---

## What This Is

Students are handed a broken AI customer support bot and told to fix it. The simulator makes visible the mechanics that are invisible in everyday AI use: how system prompts work, what context injection actually does, and why the same underlying model can behave completely differently depending on the layer built around it.

## The Exercise (~20 minutes)

A locked **Base Case** tab shows PrettyGoodPetFoods' current bot in action — a single benchmark conversation that goes badly wrong across 11 dimensions: pricing mistakes, bogus policy, competitor recommendations, delivery promises it cannot keep, wrong species advice, and more.

Students open new tabs and iterate on two levers:

| Lever | What it does |
|-------|-------------|
| **System prompt** | Rewrite the bot's instructions — tone, guardrails, context injection, conditional logic |
| **Model selection** | Switch between 12 models across 8 providers, ranging from $0.06 to $5.00 per 1M tokens |

A read-only **company context document** (product catalog, pricing, return policy) is pre-loaded into every conversation. Students cannot change it — the point is to see that the model only knows what you tell it.

A **Sample Configs** panel offers six ready-to-load presets that walk through the progression from bare role definition to full production prompt, showing how each layer (context, guardrails, tone, escalation) changes behavior.

## Learning Objectives

- **System prompt = operating contract.** The difference between a general-purpose LLM and a purpose-built agent is the layer around it, not the model itself.
- **Context injection is the simplest unlock.** If the bot does not know your business, it will invent one.
- **Guardrails are explicit, not implied.** "Be helpful" does not mean "don't recommend competitor products."
- **Model and prompt are independent levers.** A better model makes a bad prompt less bad. A better prompt makes a cheap model significantly better.
- **The application layer is what makes AI useful.** The underlying model did not change — only the layer around it.

## Models Available

12 models across 8 providers — selected to span a wide price and capability range:

| Provider | Models |
|----------|--------|
| Anthropic | Claude Haiku 4.5, Sonnet 4.6, Opus 4.6 |
| OpenAI | GPT-5.4 Nano, Mini, full |
| DeepSeek | DeepSeek V3.2 |
| Qwen | Qwen 3.5 Flash |
| z.ai | GLM-4.7 Flash |
| Moonshot AI | Kimi K2.5 |
| xAI | Grok 4.1 Fast |
| MiniMax | MiniMax M2.5 |

All requests route through [OpenRouter](https://openrouter.ai).

## Tech Stack

- **Framework:** Next.js 15 (App Router, Turbopack)
- **UI:** React 19, Tailwind CSS 4, shadcn/ui
- **AI routing:** OpenRouter API
- **Deployment:** Vercel (under the `featherhold` account)

## Local Development

```bash
npm install
```

Create `.env.local`:

```
OPENROUTER_API_KEY=your_key_here
```

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Key Design Decisions

- **PrettyGoodPetFoods** was chosen because pet food covers a rich range of real support scenarios (dietary needs, shipping, returns, subscriptions) while staying light enough to be fun.
- The **return policy is deliberately unusual** (store credit + "disgusted face photo" proof) to test whether students think to inject it into context.
- The **base case system prompt is deliberately weak** ("You are a helpful assistant. Be polite and answer questions.") so failures are obvious and attributable.
- **Password-gated** (`Overclock`) — cohort use only, not a public tool.
- The **company context document is read-only** by design — the constraint forces students to work the prompt, not the data.
- **Sample Configs** are sequenced as a learning progression: bare role → context injected → guardrails added → full production → expensive model / weak prompt → persona-forward.

---

Part of the [Overclock AI Operations Accelerator](https://overclockaccelerator.com). Built by [Ahmed Haque](https://github.com/ahmedhaque).
