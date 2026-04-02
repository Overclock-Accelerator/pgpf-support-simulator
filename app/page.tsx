'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function HomePage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined' && localStorage.getItem('pgpf_auth') === 'true') {
      router.push('/simulator')
    }
  }, [router])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => {
      if (password === 'Overclock') {
        localStorage.setItem('pgpf_auth', 'true')
        router.push('/simulator')
      } else {
        setError('Wrong password. The pets are disappointed in you.')
        setLoading(false)
      }
    }, 300)
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-swiss-paper bg-swiss-dots p-6">
      <div className="w-full max-w-xl relative">
        {/* Decorative orange circle — poster reference */}
        <div
          className="pointer-events-none absolute -right-8 -top-12 h-40 w-40 rounded-full bg-swiss-orange/25 blur-2xl"
          aria-hidden
        />

        <div className="text-center mb-10">
          <p className="label-poster text-swiss-sage mb-3">Overclock · Unit 1</p>
          <div className="inline-flex items-center justify-center w-16 h-16 bg-swiss-orange text-white rounded-sm mb-5 shadow-lg">
            <span className="text-3xl leading-none">🐾</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-swiss-ink uppercase tracking-[0.12em] leading-tight">
            PrettyGoodPetFoods
          </h1>
          <p className="text-base text-neutral-600 mt-3 max-w-md mx-auto leading-relaxed">
            &ldquo;If they ate it... It must have been pretty good!&rdquo;
          </p>
        </div>

        <div className="bg-white border-2 border-swiss-ink shadow-[8px_8px_0_0_rgba(12,12,12,0.08)] overflow-hidden">
          {/* Sky-blue bar + title — color block like poster */}
          <div className="bg-swiss-blue px-6 py-6 text-white border-b-2 border-swiss-ink">
            <p className="text-sm font-bold uppercase tracking-[0.25em] opacity-90 mb-2">Simulator</p>
            <ol className="text-lg sm:text-xl font-semibold leading-snug list-none space-y-3 m-0 p-0">
              <li className="flex gap-3">
                <span className="shrink-0 w-7 h-7 flex items-center justify-center border-2 border-white/80 text-sm font-black">1</span>
                <span>
                  Open <strong>Instructions</strong> for the full brief, then <strong>Base Case</strong> and read the scripted chat end to end.
                  Hover (or focus) the dashed <span className="font-mono font-bold">?</span> beside bot replies for facilitator notes (not part of the chat).
                </span>
              </li>
              <li className="flex gap-3">
                <span className="shrink-0 w-7 h-7 flex items-center justify-center border-2 border-white/80 text-sm font-black">2</span>
                <span>
                  Open a <strong>Variation</strong> tab and optimize support—prompt, model, context—and experiment with personality so you&apos;d actually want to talk to the bot.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="shrink-0 w-7 h-7 flex items-center justify-center border-2 border-white/80 text-sm font-black">3</span>
                <span>
                  Add <strong>more variation tabs</strong> to compare setups side by side.
                </span>
              </li>
            </ol>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x-2 divide-swiss-ink/10 border-b-2 border-swiss-ink/10">
            {[
              { icon: '📖', label: 'Instructions first', sub: 'Full exercise brief' },
              { icon: '🔍', label: 'Base Case chat', sub: 'Thread + facilitator notes' },
              { icon: '🧪', label: 'Variation tabs', sub: 'Prompt, model, context' },
            ].map(({ icon, label, sub }) => (
              <div key={label} className="px-5 py-4 text-center bg-swiss-beige/30">
                <div className="text-2xl mb-2">{icon}</div>
                <p className="text-sm font-bold uppercase tracking-widest text-swiss-ink">{label}</p>
                <p className="text-xs text-neutral-600 mt-1.5 font-medium leading-snug">{sub}</p>
              </div>
            ))}
          </div>

          <div className="px-6 py-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-bold uppercase tracking-[0.2em] text-swiss-ink mb-2">
                  Passcode
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError('') }}
                  className="w-full border-2 border-neutral-300 rounded-sm px-4 py-3.5 text-base focus:outline-none focus:border-swiss-orange focus:ring-2 focus:ring-swiss-orange/20 transition-all placeholder:text-neutral-400"
                  placeholder="Enter passcode"
                  autoFocus
                />
              </div>

              {error && (
                <div className="flex items-center gap-3 text-swiss-crimson bg-red-50 border-2 border-swiss-crimson/30 rounded-sm px-4 py-3">
                  <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm font-medium">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !password}
                className="w-full bg-swiss-orange hover:bg-[#cf5204] disabled:opacity-45 disabled:cursor-not-allowed text-white font-bold uppercase tracking-[0.2em] text-sm py-4 transition-colors flex items-center justify-center gap-2 border-2 border-swiss-ink shadow-[4px_4px_0_0_rgba(12,12,12,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0_0_rgba(12,12,12,1)]"
              >
                {loading ? (
                  <>
                    <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Entering
                  </>
                ) : (
                  <>
                    Enter simulator
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        <p className="text-center text-sm text-neutral-500 mt-6 font-medium uppercase tracking-widest">
          AI education · OpenRouter
        </p>
      </div>
    </main>
  )
}
