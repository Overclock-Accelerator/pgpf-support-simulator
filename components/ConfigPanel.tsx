'use client'

import { useState } from 'react'
import { Tab } from '@/lib/types'
import { BASE_CASE_SYSTEM_PROMPT } from '@/lib/base-case'
import { COMPANY_CONTEXT } from '@/lib/company-context'
import { MODELS } from '@/lib/models'
import ModelSelector from './ModelSelector'

interface ConfigPanelProps {
  tab: Tab
  onUpdateTab: (updates: Partial<Tab>) => void
}

function SectionHeader({
  icon,
  title,
  badge,
  open,
  onClick,
}: {
  icon: React.ReactNode
  title: string
  badge?: string
  open: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center justify-between w-full text-left py-2.5 group"
    >
      <div className="flex items-center gap-2.5">
        <div className="w-6 h-6 rounded-md bg-zinc-800 flex items-center justify-center flex-shrink-0 group-hover:bg-amber-500/20 transition-colors">
          <span className="text-zinc-400 group-hover:text-amber-400 transition-colors">{icon}</span>
        </div>
        <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider group-hover:text-zinc-200 transition-colors">
          {title}
        </span>
      </div>
      <div className="flex items-center gap-2">
        {badge && !open && (
          <span className="text-[10px] font-mono text-zinc-500 bg-zinc-800 px-1.5 py-0.5 rounded-full">
            {badge}
          </span>
        )}
        <svg
          className={`w-3.5 h-3.5 text-zinc-600 transition-transform duration-200 ${open ? 'rotate-90' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </button>
  )
}

export default function ConfigPanel({ tab, onUpdateTab }: ConfigPanelProps) {
  const [contextOpen, setContextOpen] = useState(false)
  const [promptOpen, setPromptOpen] = useState(true)
  const [modelOpen, setModelOpen] = useState(false)

  const selectedModel = MODELS.find(m => m.id === tab.modelId)
  const promptText = tab.isBaseCase ? BASE_CASE_SYSTEM_PROMPT : tab.systemPrompt
  const charCount = promptText.length

  return (
    <div className="h-full bg-zinc-950 text-zinc-100 flex flex-col">
      {/* Panel header */}
      <div className="px-4 py-3.5 border-b border-zinc-800 flex-shrink-0">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">Configuration</span>
        </div>
        {tab.isBaseCase && (
          <div className="mt-2 flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 rounded-lg px-2.5 py-1.5">
            <svg className="w-3 h-3 text-amber-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span className="text-[11px] text-amber-400 font-medium">Read-only · Base Case</span>
          </div>
        )}
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-4 divide-y divide-zinc-800/60">

          {/* Model Section */}
          <section className="py-1">
            <SectionHeader
              icon={
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18" />
                </svg>
              }
              title="Model"
              badge={selectedModel?.name}
              open={modelOpen}
              onClick={() => setModelOpen(v => !v)}
            />
            {!modelOpen && selectedModel && (
              <div className="mb-2.5 ml-8.5 flex items-center gap-2">
                <span className="text-xs text-zinc-300 font-medium">{selectedModel.name}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                  selectedModel.tier === 'fast' ? 'bg-green-900/60 text-green-400' :
                  selectedModel.tier === 'balanced' ? 'bg-blue-900/60 text-blue-400' :
                  'bg-purple-900/60 text-purple-400'
                }`}>{selectedModel.tier}</span>
              </div>
            )}
            {modelOpen && (
              <div className="pb-3">
                <ModelSelector
                  selectedModelId={tab.modelId}
                  onChange={(modelId) => onUpdateTab({ modelId })}
                  disabled={tab.isBaseCase}
                />
              </div>
            )}
          </section>

          {/* System Prompt Section */}
          <section className="py-1">
            <SectionHeader
              icon={
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              }
              title="System Prompt"
              badge={`${charCount} chars`}
              open={promptOpen}
              onClick={() => setPromptOpen(v => !v)}
            />
            {promptOpen && (
              <div className="pb-3">
                {tab.isBaseCase ? (
                  <>
                    <div className="flex items-center gap-1.5 mb-2">
                      <svg className="w-3 h-3 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      <span className="text-[11px] text-zinc-600">Locked for base case</span>
                    </div>
                    <textarea
                      value={BASE_CASE_SYSTEM_PROMPT}
                      readOnly
                      className="w-full min-h-[90px] text-xs font-mono border border-zinc-800 rounded-xl px-3 py-2.5 bg-zinc-900 text-zinc-500 resize-none focus:outline-none"
                    />
                  </>
                ) : (
                  <>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] text-zinc-600">Injected before every conversation</span>
                      <span className="text-[10px] font-mono text-zinc-600 bg-zinc-900 px-1.5 py-0.5 rounded-full">{charCount} chars</span>
                    </div>
                    <textarea
                      value={tab.systemPrompt}
                      onChange={(e) => onUpdateTab({ systemPrompt: e.target.value })}
                      className="w-full min-h-[180px] text-xs font-mono border border-zinc-800 rounded-xl px-3 py-2.5 bg-zinc-900 text-zinc-300 resize-y focus:outline-none focus:ring-1 focus:ring-amber-500/60 focus:border-amber-500/40 transition-all placeholder:text-zinc-700"
                      placeholder="Write your system prompt here..."
                    />
                  </>
                )}
              </div>
            )}
          </section>

          {/* Context Document Section */}
          <section className="py-1">
            <SectionHeader
              icon={
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              }
              title="Context Document"
              open={contextOpen}
              onClick={() => setContextOpen(v => !v)}
            />
            {contextOpen && (
              <div className="pb-3">
                <p className="text-[11px] text-zinc-600 mb-2 italic">Read-only · Pre-loaded into every conversation</p>
                <pre className="text-xs font-mono bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2.5 max-h-60 overflow-y-auto whitespace-pre-wrap break-words text-zinc-400 scrollbar-thin">
                  {COMPANY_CONTEXT}
                </pre>
              </div>
            )}
          </section>

        </div>
      </div>

      {/* Footer callout */}
      <div className="px-4 py-4 border-t border-zinc-800 flex-shrink-0">
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 text-[11px] text-amber-300/80 leading-relaxed">
          <span className="text-amber-400 font-semibold">💡 Cost context:</span>{' '}
          GLM-4.7 Flash (<span className="font-mono text-amber-300">$0.06/1M</span>) costs <em>83×</em> less than Claude Opus (<span className="font-mono text-amber-300">$5.00/1M</span>). Does quality justify price for a support bot?
        </div>
      </div>
    </div>
  )
}
