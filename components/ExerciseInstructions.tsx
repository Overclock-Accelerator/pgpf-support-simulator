const steps = [
  {
    n: '01',
    title: 'Read the Base Case',
    body: 'Open the Base Case tab and read through the transcript. Hover or tap the dashed comment icons beside each bot reply — a facilitator note pops out with coach commentary on what went wrong.',
  },
  {
    n: '02',
    title: 'Open a Variation tab and rebuild',
    body: 'Use the + button to add a Variation tab. Rewrite the system prompt, pick a model, and edit the company context until the bot gives accurate, safe, on-brand answers.',
  },
  {
    n: '03',
    title: 'Go beyond "correct enough"',
    body: 'Experiment with personality and tone — cheerfully whimsical, calmly professional, coach-like. The goal is a support experience people would actually want to use, not just one that avoids mistakes.',
  },
  {
    n: '04',
    title: 'The challenge',
    body: 'Iterate until you have a bot you yourself would feel compelled to engage with — one you\'d trust on a bad day with a sick pet, not just tolerate because you had to.',
  },
]

export default function ExerciseInstructions() {
  return (
    <div className="max-w-xl mx-auto">
      <div className="space-y-5 mb-8">
        <p className="text-base leading-loose text-neutral-700">
          Pretty Good Pet Foods Inc. recently shipped a customer-support bot that is failing in production —
          wrong prices, unsafe health answers, invented policies, dismissive replies, slow responses, and high costs.
        </p>
        <p className="text-base leading-loose text-neutral-600">
          Your job is to understand how the failure shows up, then improve it using
          the two levers the simulator exposes:  <span className="font-semibold text-swiss-ink">model selection</span> and the <span className="font-semibold text-swiss-ink">system prompt</span>.
        </p>
      </div>

      <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-swiss-sage mb-4">What to do</p>

      <ol className="space-y-3">
        {steps.map((step) => (
          <li key={step.n} className="flex gap-4 items-start">
            <span className="shrink-0 mt-0.5 w-8 h-8 flex items-center justify-center border-2 border-swiss-ink bg-swiss-beige/60 text-xs font-black tabular-nums text-swiss-ink">
              {step.n}
            </span>
            <div className="min-w-0 pt-0.5">
              <p className="text-sm font-bold text-swiss-ink mb-1">{step.title}</p>
              <p className="text-sm leading-relaxed text-neutral-600">{step.body}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  )
}
