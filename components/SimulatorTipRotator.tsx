'use client'

import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { SIMULATOR_TIPS, SIMULATOR_TIP_COUNT } from '@/lib/simulator-tips'

/** How long each tip stays visible before auto-advancing */
const TIP_DISPLAY_MS = 18_000

export default function SimulatorTipRotator() {
  const [index, setIndex] = useState(() =>
    Math.floor(Math.random() * SIMULATOR_TIP_COUNT),
  )

  useEffect(() => {
    if (SIMULATOR_TIP_COUNT <= 1) return
    const id = window.setTimeout(() => {
      setIndex((prev) => (prev + 1) % SIMULATOR_TIP_COUNT)
    }, TIP_DISPLAY_MS)
    return () => window.clearTimeout(id)
  }, [index])

  const goPrev = () => {
    setIndex((prev) => (prev - 1 + SIMULATOR_TIP_COUNT) % SIMULATOR_TIP_COUNT)
  }

  const goNext = () => {
    setIndex((prev) => (prev + 1) % SIMULATOR_TIP_COUNT)
  }

  const n = index + 1
  const label = n < 10 ? `0${n}` : String(n)
  const total =
    SIMULATOR_TIP_COUNT < 10
      ? `0${SIMULATOR_TIP_COUNT}`
      : String(SIMULATOR_TIP_COUNT)

  return (
    <div className="border-t-2 border-swiss-ink bg-gradient-to-br from-swiss-blue/12 via-white to-swiss-orange/5 px-4 py-4 shrink-0 overflow-hidden">
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="inline-flex min-w-0 items-center gap-2">
          <span className="pgpf-tip-pulse text-sm font-bold uppercase tracking-[0.25em] text-swiss-blue">
            Tip:
          </span>
          <span className="font-mono text-xs font-bold tabular-nums text-neutral-500">
            {label}/{total}
          </span>
        </span>
        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={goPrev}
            disabled={SIMULATOR_TIP_COUNT <= 1}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-swiss-ink/15 bg-white text-swiss-ink shadow-sm transition hover:bg-swiss-blue/10 hover:border-swiss-blue/30 disabled:pointer-events-none disabled:opacity-40"
            aria-label="Previous tip"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden />
          </button>
          <button
            type="button"
            onClick={goNext}
            disabled={SIMULATOR_TIP_COUNT <= 1}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-swiss-ink/15 bg-white text-swiss-ink shadow-sm transition hover:bg-swiss-blue/10 hover:border-swiss-blue/30 disabled:pointer-events-none disabled:opacity-40"
            aria-label="Next tip"
          >
            <ChevronRight className="h-4 w-4" aria-hidden />
          </button>
        </div>
      </div>
      <div className="relative min-h-[4.75rem] sm:min-h-[4.25rem]">
        <p
          key={index}
          className="pgpf-simulator-tip-body text-sm leading-relaxed text-swiss-ink"
        >
          {SIMULATOR_TIPS[index]}
        </p>
      </div>
    </div>
  )
}
