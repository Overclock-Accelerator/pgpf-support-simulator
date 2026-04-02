'use client'

import { MODELS, PROVIDER_ORDER, formatPrice, getPriceColor } from '@/lib/models'

interface ModelSelectorProps {
  selectedModelId: string
  onChange: (modelId: string) => void
  disabled?: boolean
}

const TIER_BADGE: Record<string, string> = {
  fast:     'bg-green-100 text-green-700',
  balanced: 'bg-blue-100 text-blue-700',
  premium:  'bg-purple-100 text-purple-700',
}

export default function ModelSelector({ selectedModelId, onChange, disabled }: ModelSelectorProps) {
  const grouped = PROVIDER_ORDER.reduce<Record<string, typeof MODELS>>((acc, provider) => {
    const models = MODELS.filter(m => m.provider === provider)
    if (models.length > 0) acc[provider] = models
    return acc
  }, {})

  return (
    <div className="space-y-3">
      {disabled && (
        <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded px-2 py-1 flex items-center gap-1">
          🔒 Model locked in Base Case
        </p>
      )}

      {/* Price legend */}
      <div className="flex items-center gap-3 text-xs text-gray-500 bg-gray-50 rounded px-2 py-1.5">
        <span className="font-medium">Price/1M tokens:</span>
        <span className="text-green-600 font-medium">● Cheap</span>
        <span className="text-amber-600 font-medium">● Mid</span>
        <span className="text-red-500 font-medium">● Pricey</span>
      </div>

      {Object.entries(grouped).map(([provider, models]) => (
        <div key={provider}>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1 px-0.5">
            {provider}
          </p>
          <div className="space-y-1">
            {models.map(model => {
              const isSelected = model.id === selectedModelId
              return (
                <button
                  key={model.id}
                  onClick={() => !disabled && onChange(model.id)}
                  disabled={disabled}
                  className={`
                    w-full text-left rounded-lg px-3 py-2 border transition-all
                    ${isSelected
                      ? 'border-amber-400 bg-amber-50 shadow-sm'
                      : 'border-gray-200 bg-white hover:border-amber-200 hover:bg-amber-50/40'
                    }
                    ${disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}
                  `}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      {isSelected && <span className="text-amber-500 text-xs">▶</span>}
                      <span className="text-sm font-medium text-gray-800 truncate">
                        {model.name}
                      </span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium shrink-0 ${TIER_BADGE[model.tier]}`}>
                        {model.tier}
                      </span>
                    </div>
                    <span className={`text-xs font-mono font-semibold shrink-0 ${getPriceColor(model.pricePer1M)}`}>
                      {formatPrice(model.pricePer1M)}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-400 mt-0.5 pl-0">{model.description}</p>
                </button>
              )
            })}
          </div>
        </div>
      ))}

      {/* Price perspective callout */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-2.5 text-[11px] text-amber-800 leading-relaxed">
        💡 <strong>Context:</strong> At $0.06/1M tokens, GLM-4.7 Flash costs <em>83x less</em> than Claude Opus at $5.00/1M. Does the quality difference justify the price for a support bot?
      </div>
    </div>
  )
}
