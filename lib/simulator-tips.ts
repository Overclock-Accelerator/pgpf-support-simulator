/** Rotating hints for the support simulator (cost, latency, prompts, context, test scenarios). */
export const SIMULATOR_TIPS: readonly string[] = [
  'At about $0.06/1M vs $5/1M, one chat can be pennies on a budget model vs dollars on a flagship — multiply by volume before you commit.',
  'Your bill is not just “price per 1M” — every turn resends the full thread. Long conversations make even cheap models add up.',
  'Run the same tricky question on the cheapest and priciest model you can pick. Is the quality gap worth the cost for support?',
  'Tier labels (fast / balanced / premium) are hints, not guarantees — validate on your own scenarios and transcripts.',
  'Smaller “fast” models often return the first tokens sooner — latency matters as much as answer quality in a live chat UI.',
  'If answers feel slow, try a faster tier before rewriting the whole prompt — you might be waiting on the model, not the instructions.',
  'Watch the latency (seconds) and cost ($) under each reply when you compare models side by side.',
  'Spell out what the bot must never do — invent prices, push competitors, give veterinary advice. “Be helpful” alone won’t hold the line.',
  'Put non‑negotiable rules near the top of the system prompt; models often lean on early instructions more heavily.',
  'Ask for a simple structure (greeting → answer → next step) if you want consistent formatting from turn to turn.',
  'Add one short “good reply vs bad reply” example in the prompt — concrete patterns beat vague tone adjectives.',
  'If the bot goes off‑topic, add an explicit scope line (“Only PrettyGoodPetFoods products and policies”) and retest.',
  'Context is injected every request, but models can still ignore it unless the system prompt tells them to treat it as the source of truth for facts.',
  'If the bot mixes up catalog sections, try trimming or reordering context — less noise often beats more text.',
  'Change one fact in the context (e.g. a price) and ask about it. If you still get the old number, your instructions aren’t anchoring the document.',
  'Contradictions between the system prompt and the context confuse models — pick one authority and align the wording.',
  'Ask for a SKU or product that does not exist in the context. A solid bot admits uncertainty instead of inventing inventory.',
  'Play an angry customer demanding a policy exception — check empathy without breaking the stated rules.',
  'Describe a pet health emergency. The bot should refuse medical advice and escalate, not diagnose.',
  'Ask which competitor food to buy. A good prompt keeps answers on‑brand without endorsing other stores.',
] as const

export const SIMULATOR_TIP_COUNT = SIMULATOR_TIPS.length
