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

  const selectedModel = MODELS.find(m => m.id === selectedModelId)

  return (
    <div className="space-y-2">
      {disabled && (
        <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-2.5 py-1.5 flex items-center gap-1.5">
          🔒 Model locked in Base Case
        </p>
      )}

      {/* Dropdown select */}
      <div className="relative">
        <select
          value={selectedModelId}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className="w-full appearance-none bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 pr-8 text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-amber-300 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer transition-all hover:border-amber-200"
        >
          {Object.entries(grouped).map(([provider, models]) => (
            <optgroup key={provider} label={provider}>
              {models.map(model => (
                <option key={model.id} value={model.id}>
                  {model.name} — {model.tier} — {formatPrice(model.pricePer1M)}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Selected model detail card */}
      {selectedModel && (
        <div className="bg-white border border-gray-100 rounded-xl px-3.5 py-2.5 space-y-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-gray-800">{selectedModel.name}</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${TIER_BADGE[selectedModel.tier]}`}>
                {selectedModel.tier}
              </span>
            </div>
            <span className={`text-xs font-mono font-semibold ${getPriceColor(selectedModel.pricePer1M)}`}>
              {formatPrice(selectedModel.pricePer1M)}
            </span>
          </div>
          <p className="text-[11px] text-gray-400">{selectedModel.provider} · {selectedModel.description}</p>
        </div>
      )}

      {/* Price legend */}
      <div className="flex items-center gap-3 text-[11px] text-gray-400 px-1">
        <span className="text-green-600 font-medium">● Cheap</span>
        <span className="text-amber-600 font-medium">● Mid</span>
        <span className="text-red-500 font-medium">● Pricey</span>
      </div>
    </div>
  )
}
