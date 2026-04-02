import { BASE_CASE_MODEL_ID, getModel } from '@/lib/models'

export default function ExerciseInstructions() {
  const baseCaseModelLabel = getModel(BASE_CASE_MODEL_ID)?.name ?? 'the locked model'

  return (
    <div className="max-w-3xl space-y-4 text-sm leading-relaxed text-neutral-800 sm:text-base">
      <p>
        PrettyGoodPetFoods recently shipped a customer-support chatbot to production. The rollout did not go well: real shoppers are getting wrong
        prices, unsafe answers on pet health, invented policies, and replies that read like the bot cannot be bothered. Your job in this
        exercise is to understand how that failure shows up in live-style chat, then improve the experience using the levers this simulator
        exposes.
      </p>
      <p className="text-neutral-700">
        On the <strong className="text-swiss-ink">Base Case</strong> tab you will see a{' '}
        <strong className="text-swiss-ink">benchmark transcript</strong>—a frozen, read-only thread from go-live week. It is not a conversation
        you can extend there; it is the &ldquo;before&rdquo; picture you are trying to beat in your own variation tabs.
      </p>

      <p className="text-xs font-bold uppercase tracking-[0.18em] text-swiss-sage pt-2">What to do</p>
      <ol className="list-decimal list-inside space-y-2 marker:font-bold marker:text-swiss-ink">
        <li>
          Open <strong className="text-swiss-ink">Base Case</strong> and read that thread from top to bottom. Hover, focus, or tap the dashed{' '}
          <span className="font-mono font-bold text-swiss-ink">?</span> beside each bot message — a{' '}
          <strong className="text-swiss-blue">facilitator</strong> panel pops out (not part of the transcript) with coach notes on wrong answers,
          missed policies, safety gaps, and what could be improved.
        </li>
        <li>
          Open a <strong className="text-swiss-ink">new variation tab</strong> and rebuild support: tighten the system prompt, pick a model, and
          align the company context doc so answers are <strong className="text-swiss-ink">accurate, safe, and on-brand</strong>.
        </li>
        <li>
          Push past &ldquo;correct enough.&rdquo; Experiment with <strong className="text-swiss-ink">personality and orientation</strong> in the
          system prompt — tone, empathy boundaries, how proactive the bot is, and how it frames policies (clear vs. dismissive). Try different
          stances: cheerfully whimsical, calmly professional, coach-like, and so on. The goal is not only fewer mistakes but a support experience
          people will actually use.
        </li>
        <li>
          <strong className="text-swiss-ink">Challenge:</strong> iterate until you have a customer-support bot you yourself would{' '}
          <strong className="text-swiss-ink">feel compelled to engage with</strong> — one you would trust on a bad day with a sick pet, not just
          tolerate because you had to.
        </li>
        <li>
          Add <strong className="text-swiss-ink">additional variation tabs</strong> to keep exploring — swap models, iterate on prompts, edit
          context, and compare how each setup behaves side by side.
        </li>
      </ol>

      <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed border-l-2 border-swiss-orange/60 pl-3 pt-1">
        The Base Case transcript is simulated for that tab&apos;s locked prompt and {baseCaseModelLabel}: deliberately short, flat replies that
        still violate catalog facts, policies, species fit, and safety guidance. Latency and cost per bot line increase as the thread grows,
        roughly like a long chat with a flagship model.
      </p>
    </div>
  )
}
