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
| **Model selection** | Switch between 14 models across 8 providers, ranging from $0.06 to $10.00 per 1M tokens |

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

The 6 reference configurations (transcripts are pre-generated — see "Preloaded solution transcripts" below):

| # | Name | Model | Lesson |
|---|------|-------|--------|
| 01 | Bare Role | Qwen 3.5 Flash | Role alone — no context, no guardrails |
| 02 | Context Injected | Qwen 3.5 Flash | Same cheap model — context injection alone transforms results |
| 03 | Guardrails Added | DeepSeek V3.2 | Explicit rules prevent behaviors "be helpful" never would |
| 04 | Full Production | Claude Haiku 4.5 | Role + context + guardrails + tone + escalation |
| 05 | Expensive Model, Weak Prompt | Claude Opus 5 | Premium model + bad prompt — money does not fix prompt engineering |
| 06 | Persona-Forward | GPT-5.6 Terra | Tone and personality are explicit choices, not defaults |

## Models Available

12 models across 8 providers — selected to span a wide price and capability range:

| Provider | Models |
|----------|--------|
| Anthropic (direct) | Claude Haiku 4.5, Sonnet 5, Opus 5 |
| OpenAI (direct) | GPT-5.6 Luna, Terra, Sol |
| DeepSeek | DeepSeek V3.2 |
| Qwen | Qwen 3.5 Flash |
| z.ai | GLM-4.7 Flash |
| Moonshot AI | Kimi K2.5 |
| xAI | Grok 4.1 Fast |
| MiniMax | MiniMax M2.5 |

Anthropic and OpenAI models are called directly through their native APIs; all other providers route through [OpenRouter](https://openrouter.ai).

## Tech Stack

- **Framework:** Next.js 16 (App Router, Turbopack)
- **UI:** React 19, Tailwind CSS 4, shadcn/ui
- **AI routing:** direct Anthropic + OpenAI APIs, OpenRouter for the remaining roster
- **Deployment:** Vercel (under the `featherhold` account)

## Environment Variables

Create `.env.local`:

```
ANTHROPIC_API_KEY=your_key_here   # direct Anthropic models (Haiku 4.5, Sonnet 5, Opus 5)
OPENAI_API_KEY=your_key_here      # direct OpenAI models (GPT-5.6 Luna/Terra/Sol)
OPENROUTER_API_KEY=your_key_here  # only needed for the non-Anthropic/OpenAI roster
                                  # (DeepSeek, Qwen, z.ai, Moonshot, xAI, MiniMax)
```

Never commit keys. On Vercel, set the same three variables on the project
(production + preview).

## Preloaded Solution Transcripts

The instructor **Solution view** loads all 6 reference tabs from a committed,
pre-generated transcript file — `lib/preloaded-solutions.ts`. It makes **zero
`/api/chat` calls** at demo time: instant, deterministic, and free to replay.

To regenerate the transcripts (e.g. after changing a sample config or model):

```bash
npm run generate-solutions
```

This replays the 13 base-case user turns against each of the 6 sample configs
through the same provider routing as `/api/chat` — ~78 small LLM calls,
sequential, one-time, roughly **$0.10–$0.30** depending on current OpenRouter
pricing. Requires the provider keys above. If `OPENROUTER_API_KEY` is not
available locally, the OpenRouter-model configs can be replayed through a
deployed instance that holds the key:

```bash
SOLUTIONS_REMOTE_CHAT_URL=https://<your-deploy>.vercel.app/api/chat npm run generate-solutions
```

Commit the regenerated `lib/preloaded-solutions.ts` and redeploy. If the file
is missing or empty, the Solution view shows a "run npm run generate-solutions"
notice instead of making live calls.

## Local Development

```bash
npm install
```

Set the environment variables described above in `.env.local`, then:

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
