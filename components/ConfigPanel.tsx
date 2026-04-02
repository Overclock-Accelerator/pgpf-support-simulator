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
  const [promptOpen, setPromptOpen] = useState(true)

  return (
    <div className="p-4 flex flex-col gap-5">
      {/* Model Section */}
      <section>
        <h2 className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Model</h2>
        <ModelSelector
          selectedModelId={tab.modelId}
          onChange={(modelId) => onUpdateTab({ modelId })}
          disabled={tab.isBaseCase}
        />
      </section>

      {/* System Prompt Section — collapsible */}
      <section>
        <button
          onClick={() => setPromptOpen((v) => !v)}
          className="flex items-center justify-between w-full text-left mb-2 group"
        >
          <div className="flex items-center gap-2">
            <svg
              className={`w-3 h-3 text-gray-400 transition-transform duration-200 ${promptOpen ? 'rotate-90' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <h2 className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider group-hover:text-amber-600 transition-colors">
              System Prompt
            </h2>
          </div>
          <span className="text-[10px] bg-gray-100 text-gray-400 px-1.5 py-0.5 rounded-full font-mono">
            {tab.isBaseCase ? BASE_CASE_SYSTEM_PROMPT.length : tab.systemPrompt.length} chars
          </span>
        </button>
        {promptOpen && (
          <>
            {tab.isBaseCase ? (
              <div>
                <div className="flex items-center gap-1 text-xs text-gray-400 mb-1.5">
                  <span>🔒</span>
                  <span>Locked for base case</span>
                </div>
                <textarea
                  value={BASE_CASE_SYSTEM_PROMPT}
                  readOnly
                  className="w-full min-h-[80px] text-xs font-mono border border-gray-200 rounded-xl px-3 py-2.5 bg-gray-50 text-gray-500 resize-none"
                />
              </div>
            ) : (
              <textarea
                value={tab.systemPrompt}
                onChange={(e) => onUpdateTab({ systemPrompt: e.target.value })}
                className="w-full min-h-[160px] text-xs font-mono border border-gray-200 rounded-xl px-3 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-amber-300 resize-y transition-all"
                placeholder="Write your system prompt here..."
              />
            )}
          </>
        )}
      </section>

      {/* Context Document Section — collapsible */}
      <section>
        <button
          onClick={() => setContextOpen((v) => !v)}
          className="flex items-center gap-2 w-full text-left group"
        >
          <svg
            className={`w-3 h-3 text-gray-400 transition-transform duration-200 ${contextOpen ? 'rotate-90' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <h2 className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider group-hover:text-amber-600 transition-colors">
            Context Document
          </h2>
        </button>
        {contextOpen && (
          <div className="mt-2">
            <p className="text-[11px] text-gray-400 mb-1.5 italic">Read-only · Pre-loaded into every conversation</p>
            <pre className="text-xs font-mono bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 max-h-64 overflow-y-auto whitespace-pre-wrap break-words text-gray-600">
              {COMPANY_CONTEXT}
            </pre>
          </div>
        )}
      </section>

      {/* Price callout */}
      <div className="bg-amber-50/60 border border-amber-100 rounded-xl p-3 text-[11px] text-amber-700 leading-relaxed">
        💡 <strong>Context:</strong> At $0.06/1M tokens, GLM-4.7 Flash costs <em>83x less</em> than Claude Opus at $5.00/1M. Does the quality difference justify the price for a support bot?
      </div>
    </div>
  )
}
