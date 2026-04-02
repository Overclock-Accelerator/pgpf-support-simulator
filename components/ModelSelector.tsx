'use client'

import { MODELS, PROVIDER_ORDER, formatPrice, getPriceColor } from '@/lib/models'

interface ModelSelectorProps {
  selectedModelId: string
  onChange: (modelId: string) => void
  disabled?: boolean
}

const TIER_BADGE: Record<string, { bg: string; text: string; label: string }> = {
  fast:     { bg: 'bg-green-900/60', text: 'text-green-400', label: 'fast' },
  balanced: { bg: 'bg-blue-900/60',  text: 'text-blue-400',  label: 'balanced' },
  premium:  { bg: 'bg-purple-900/60', text: 'text-purple-400', label: 'premium' },
}

// Max price for bar scaling
const MAX_PRICE = 5.00

export default function ModelSelector({ selectedModelId, onChange, disabled }: ModelSelectorProps) {
  const grouped = PROVIDER_ORDER.reduce<Record<string, typeof MODELS>>((acc, provider) => {
    const models = MODELS.filter(m => m.provider === provider)
    if (models.length > 0) acc[provider] = models
    return acc
  }, {})

  return (
    <div className="space-y-4">
      {disabled && (
        <div className="flex items-center gap-1.5 text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-lg px-2.5 py-1.5">
          <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          Model locked in Base Case
        </div>
      )}

      {/* Legend */}
      <div className="flex items-center gap-3 text-[10px] text-zinc-500">
        <span className="text-zinc-600 font-medium">Cost per 1M tokens:</span>
        <span className="flex items-center gap-1 text-green-500">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
          Cheap
        </span>
        <span className="flex items-center gap-1 text-amber-400">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" />
          Mid
        </span>
        <span className="flex items-center gap-1 text-red-400">
          <span className="w-1.5 h-1.5 rounded-full bg-red-400 inline-block" />
          Pricey
        </span>
      </div>

      {Object.entries(grouped).map(([provider, models]) => (
        <div key={provider}>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-600 mb-1.5 px-0.5">
            {provider}
          </p>
          <div className="space-y-1">
            {models.map(model => {
              const isSelected = model.id === selectedModelId
              const badge = TIER_BADGE[model.tier]
              const barPct = Math.min((model.pricePer1M / MAX_PRICE) * 100, 100)
              const barColor = model.pricePer1M <= 0.20 ? 'bg-green-500' :
                               model.pricePer1M <= 1.00 ? 'bg-amber-400' : 'bg-red-400'

              return (
                <button
                  key={model.id}
                  onClick={() => !disabled && onChange(model.id)}
                  disabled={disabled}
                  className={`
                    w-full text-left rounded-xl px-3 py-2.5 border transition-all
                    ${isSelected
                      ? 'border-amber-500/50 bg-amber-500/10 shadow-sm shadow-amber-900/20'
                      : 'border-zinc-800 bg-zinc-900 hover:border-zinc-700 hover:bg-zinc-800/80'
                    }
                    ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                  `}
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2 min-w-0">
                      {isSelected && (
                        <svg className="w-3 h-3 text-amber-400 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                          <circle cx="12" cy="12" r="6" />
                        </svg>
                      )}
                      <span className={`text-xs font-semibold truncate ${isSelected ? 'text-amber-100' : 'text-zinc-200'}`}>
                        {model.name}
                      </span>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-semibold shrink-0 uppercase tracking-wide ${badge.bg} ${badge.text}`}>
                        {badge.label}
                      </span>
                    </div>
                    <span className={`text-[11px] font-mono font-bold shrink-0 ${getPriceColor(model.pricePer1M)}`}>
                      {formatPrice(model.pricePer1M)}
                    </span>
                  </div>

                  {/* Cost bar */}
                  <div className="h-1 bg-zinc-800 rounded-full overflow-hidden mb-1.5">
                    <div
                      className={`h-full rounded-full transition-all ${barColor}`}
                      style={{ width: `${Math.max(barPct, 2)}%` }}
                    />
                  </div>

                  <p className="text-[10px] text-zinc-500">{model.description}</p>
                </button>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
