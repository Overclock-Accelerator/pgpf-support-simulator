'use client'

import { useState } from 'react'
import { Tab } from '@/lib/types'
import { BASE_CASE_SYSTEM_PROMPT } from '@/lib/base-case'
import { COMPANY_CONTEXT } from '@/lib/company-context'
import ModelSelector from './ModelSelector'

interface ConfigPanelProps {
  tab: Tab
  onUpdateTab: (updates: Partial<Tab>) => void
}

export default function ConfigPanel({ tab, onUpdateTab }: ConfigPanelProps) {
  const [contextOpen, setContextOpen] = useState(false)

  return (
    <div className="p-4 flex flex-col gap-6">
      {/* Model Section */}
      <section>
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Model</h2>
        <ModelSelector
          selectedModelId={tab.modelId}
          onChange={(modelId) => onUpdateTab({ modelId })}
          disabled={tab.isBaseCase}
        />
      </section>

      {/* System Prompt Section */}
      <section>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">System Prompt</h2>
          <span className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full">
            {tab.isBaseCase ? BASE_CASE_SYSTEM_PROMPT.length : tab.systemPrompt.length} chars
          </span>
        </div>
        {tab.isBaseCase ? (
          <div>
            <div className="flex items-center gap-1 text-xs text-gray-400 mb-1">
              <span>🔒</span>
              <span>Locked for base case</span>
            </div>
            <textarea
              value={BASE_CASE_SYSTEM_PROMPT}
              readOnly
              className="w-full min-h-[80px] text-xs font-mono border border-gray-200 rounded-lg px-3 py-2 bg-gray-50 text-gray-500 resize-none"
            />
          </div>
        ) : (
          <textarea
            value={tab.systemPrompt}
            onChange={(e) => onUpdateTab({ systemPrompt: e.target.value })}
            className="w-full min-h-[180px] text-xs font-mono border border-amber-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-amber-300 resize-y"
            placeholder="Write your system prompt here..."
          />
        )}
      </section>

      {/* Context Document Section */}
      <section>
        <button
          onClick={() => setContextOpen((v) => !v)}
          className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wide hover:text-amber-600 transition-colors w-full text-left"
        >
          <span>{contextOpen ? '▼' : '▶'}</span>
          <span>Context Document</span>
        </button>
        {contextOpen && (
          <div className="mt-2">
            <p className="text-xs text-gray-400 mb-1 italic">Read-only · Pre-loaded into every conversation</p>
            <pre className="text-xs font-mono bg-white/50 border border-gray-200 rounded-lg px-3 py-2 max-h-64 overflow-y-auto whitespace-pre-wrap break-words">
              {COMPANY_CONTEXT}
            </pre>
          </div>
        )}
      </section>
    </div>
  )
}
