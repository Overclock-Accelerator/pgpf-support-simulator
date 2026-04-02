# PrettyGoodPetFoods Support Simulator

An educational breakout activity for the **[Overclock AI Operations Accelerator](https://overclockaccelerator.com)** — Unit 1: "Beyond ChatGPT: Navigating the AI Tool Landscape."

**Live:** https://pgpf-support-simulator.vercel.app &middot; **Student password:** `Overclock`

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

## Learning Objectives

- **System prompt = operating contract.** The difference between a general-purpose LLM and a purpose-built agent is the layer around it, not the model itself.
- **Context injection is the simplest unlock.** If the bot does not know your business, it will invent one.
- **Guardrails are explicit, not implied.** "Be helpful" does not mean "don't recommend competitor products."
- **Model and prompt are independent levers.** A better model makes a bad prompt less bad. A better prompt makes a cheap model significantly better.
- **The application layer is what makes AI useful.** The underlying model did not change — only the layer around it.

## Instructor Tools

A password-gated **Instructor Tools** panel is available in the configuration sidebar (visible on any variation tab, not the Base Case).

**Instructor password:** `OpsFTW`

Once authenticated, instructors can load any of 6 reference configurations that walk through the learning progression — from a bare role definition to a full production prompt. Auth persists for the browser session (sessionStorage), so it clears when the tab closes.

The 6 reference configurations:

| # | Name | Model | Lesson |
|---|------|-------|--------|
| 01 | Bare Role | Qwen 3.5 Flash | Role alone — no context, no guardrails |
| 02 | Context Injected | Qwen 3.5 Flash | Same cheap model — context injection alone transforms results |
| 03 | Guardrails Added | DeepSeek V3.2 | Explicit rules prevent behaviors "be helpful" never would |
| 04 | Full Production | Claude Haiku 4.5 | Role + context + guardrails + tone + escalation |
| 05 | Expensive Model, Weak Prompt | Claude Opus 4.6 | Premium model + bad prompt — money does not fix prompt engineering |
| 06 | Persona-Forward | GPT-5.4 Mini | Tone and personality are explicit choices, not defaults |

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
- **Student password** (`Overclock`) gates the main simulator. Students start with a blank system prompt and discover the layers themselves.
- **Instructor password** (`OpsFTW`) gates the reference configurations — these are answer keys, not starting points for students.
- The **company context document is read-only** by design — the constraint forces students to work the prompt, not the data.
- **Instructor auth uses sessionStorage** — clears when the tab closes, so sharing a screen with students does not persist instructor access across sessions.

---

Part of the [Overclock AI Operations Accelerator](https://overclockaccelerator.com). Built by [Ahmed Haque](https://github.com/ahmedhaque).
