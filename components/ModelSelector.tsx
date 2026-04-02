'use client'

import { MODELS, formatPrice, getPriceColor } from '@/lib/models'

function modelsByPriceDesc() {
  return [...MODELS].sort(
    (a, b) => b.pricePer1M - a.pricePer1M || a.name.localeCompare(b.name)
  )
}

interface ModelSelectorProps {
  selectedModelId: string
  onChange: (modelId: string) => void
  disabled?: boolean
}

const TIER_BADGE: Record<string, { box: string }> = {
  fast:     { box: 'bg-emerald-100 text-emerald-900 border-emerald-800' },
  balanced: { box: 'bg-sky-100 text-sky-900 border-swiss-blue' },
  premium:  { box: 'bg-violet-100 text-violet-900 border-violet-800' },
}

const MAX_PRICE = 5.00

export default function ModelSelector({ selectedModelId, onChange, disabled }: ModelSelectorProps) {
  const sortedModels = modelsByPriceDesc()

  return (
    <div className="space-y-5">
      {disabled && (
        <div className="flex items-center gap-2 text-sm font-semibold text-swiss-ink bg-swiss-orange/15 border-2 border-swiss-orange px-3 py-2.5">
          <svg className="w-4 h-4 flex-shrink-0 text-swiss-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          Model locked in base case
        </div>
      )}

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm font-semibold text-neutral-700">
        <span className="uppercase tracking-wider text-xs text-swiss-ink">$/1M · high → low</span>
        <span className="flex items-center gap-1.5 text-emerald-700">
          <span className="w-2 h-2 rounded-full bg-emerald-600" />
          Cheap
        </span>
        <span className="flex items-center gap-1.5 text-amber-700">
          <span className="w-2 h-2 rounded-full bg-amber-500" />
          Mid
        </span>
        <span className="flex items-center gap-1.5 text-swiss-crimson">
          <span className="w-2 h-2 rounded-full bg-swiss-crimson" />
          Pricey
        </span>
      </div>

      <div className="space-y-2">
        {sortedModels.map(model => {
          const isSelected = model.id === selectedModelId
          const badge = TIER_BADGE[model.tier]
          const barPct = Math.min((model.pricePer1M / MAX_PRICE) * 100, 100)
          const barColor = model.pricePer1M <= 0.20 ? 'bg-emerald-500' :
                           model.pricePer1M <= 1.00 ? 'bg-swiss-orange' : 'bg-swiss-crimson'

          return (
            <button
              key={model.id}
              onClick={() => !disabled && onChange(model.id)}
              disabled={disabled}
              className={`
                w-full text-left border-2 px-3 py-3 transition-all
                ${isSelected
                  ? 'border-swiss-ink bg-swiss-blue/10 shadow-[4px_4px_0_0_rgba(12,12,12,0.15)]'
                  : 'border-neutral-300 bg-white hover:border-swiss-ink hover:bg-swiss-beige/20'
                }
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              <div className="flex items-center justify-between gap-3 mb-1">
                <div className="flex items-center gap-2 min-w-0 flex-wrap">
                  {isSelected && (
                    <span className="w-2 h-2 rounded-full bg-swiss-orange shrink-0" />
                  )}
                  <span className={`text-base font-bold truncate ${isSelected ? 'text-swiss-ink' : 'text-neutral-800'}`}>
                    {model.name}
                  </span>
                  <span className={`text-xs px-2 py-0.5 font-bold uppercase tracking-wider border-2 shrink-0 ${badge.box}`}>
                    {model.tier}
                  </span>
                </div>
                <span className={`text-sm font-mono font-bold shrink-0 ${getPriceColor(model.pricePer1M)}`}>
                  {formatPrice(model.pricePer1M)}
                </span>
              </div>
              <p className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2">{model.provider}</p>

              <div className="h-1.5 bg-neutral-200 border border-neutral-300 overflow-hidden mb-2">
                <div
                  className={`h-full ${barColor}`}
                  style={{ width: `${Math.max(barPct, 3)}%` }}
                />
              </div>

              <p className="text-sm text-neutral-600">{model.description}</p>
            </button>
          )
        })}
      </div>
    </div>
  )
}
