'use client'

import { useState, useCallback } from 'react'
import { Tab } from '@/lib/types'
import { BASE_CASE_SYSTEM_PROMPT } from '@/lib/base-case'
import { COMPANY_CONTEXT, resolveContextForRequest } from '@/lib/company-context'
import { MODELS } from '@/lib/models'
import ModelSelector from './ModelSelector'
import SimulatorTipRotator from './SimulatorTipRotator'

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
      className="flex items-center justify-between w-full text-left py-3 group gap-2"
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-9 h-9 border-2 border-swiss-ink bg-swiss-beige/50 flex items-center justify-center shrink-0 group-hover:bg-swiss-blue group-hover:text-white group-hover:border-swiss-blue transition-colors">
          <span className="text-swiss-ink group-hover:text-white">{icon}</span>
        </div>
        <span className="text-sm font-bold uppercase tracking-[0.2em] text-swiss-ink shrink-0 whitespace-nowrap">
          {title}
        </span>
      </div>
      <div className="flex items-center gap-2 shrink-0 min-w-0 justify-end flex-1">
        {!open && badge && (
          <span className="flex items-center gap-2 min-w-0 flex-1 justify-end">
            <span className="text-xs font-mono font-semibold text-neutral-700 bg-white border-2 border-neutral-300 px-2 py-1 min-w-0 max-w-full text-right truncate sm:max-w-[min(20rem,calc(100vw-10rem))]">
              {badge}
            </span>
          </span>
        )}
        <svg
          className={`w-4 h-4 text-neutral-500 transition-transform duration-200 shrink-0 ${open ? 'rotate-90' : ''}`}
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

function ContextDocOpenBody({ tab, onUpdateTab }: ConfigPanelProps) {
  const contextFieldValue =
    tab.companyContext !== undefined ? tab.companyContext : COMPANY_CONTEXT
  const contextForClipboard = tab.isBaseCase
    ? COMPANY_CONTEXT
    : resolveContextForRequest(tab.companyContext)

  const [contextCopyState, setContextCopyState] = useState<'idle' | 'done' | 'error'>('idle')

  const copyCompanyContext = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(contextForClipboard)
      setContextCopyState('done')
      window.setTimeout(() => setContextCopyState('idle'), 2000)
    } catch {
      setContextCopyState('error')
      window.setTimeout(() => setContextCopyState('idle'), 2500)
    }
  }, [contextForClipboard])

  const contextCopyLabel =
    contextCopyState === 'done'
      ? 'Copied'
      : contextCopyState === 'error'
        ? 'Copy failed'
        : 'Copy context'

  return (
    <div className="pb-4">
      {tab.isBaseCase ? (
        <>
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
            <p className="text-sm text-neutral-600 font-medium">Canonical catalog · not editable</p>
            <button
              type="button"
              onClick={copyCompanyContext}
              className="text-xs font-bold uppercase tracking-wider border-2 border-swiss-ink px-2 py-1 bg-white hover:bg-swiss-beige/50 transition-colors shrink-0"
            >
              {contextCopyLabel}
            </button>
          </div>
          <pre className="text-sm font-mono bg-swiss-beige/40 border-2 border-neutral-300 rounded-sm px-3 py-3 max-h-72 overflow-y-auto whitespace-pre-wrap wrap-break-word text-swiss-ink leading-relaxed scrollbar-thin">
            {COMPANY_CONTEXT}
          </pre>
        </>
      ) : (
        <>
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
            <p className="text-sm text-neutral-600 font-medium">
              Injected with every message · leave empty to restore default catalog
            </p>
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={copyCompanyContext}
                className="text-xs font-bold uppercase tracking-wider border-2 border-swiss-ink px-2 py-1 bg-white hover:bg-swiss-beige/50 transition-colors"
              >
                {contextCopyLabel}
              </button>
              <button
                type="button"
                onClick={() => onUpdateTab({ companyContext: COMPANY_CONTEXT })}
                className="text-xs font-bold uppercase tracking-wider border-2 border-swiss-ink px-2 py-1 bg-white hover:bg-swiss-beige/50 transition-colors"
              >
                Reset to default
              </button>
            </div>
          </div>
          <textarea
            value={contextFieldValue}
            onChange={(e) => onUpdateTab({ companyContext: e.target.value })}
            className="w-full min-h-[220px] text-sm font-mono border-2 border-swiss-ink rounded-sm px-3 py-3 bg-white text-swiss-ink resize-y focus:outline-none focus:ring-2 focus:ring-swiss-blue/30 focus:border-swiss-blue leading-relaxed scrollbar-thin"
            spellCheck={false}
          />
        </>
      )}
    </div>
  )
}

export default function ConfigPanel({ tab, onUpdateTab }: ConfigPanelProps) {
  const [contextOpen, setContextOpen] = useState(false)
  const [promptOpen, setPromptOpen] = useState(false)
  const [modelOpen, setModelOpen] = useState(false)

  if (tab.isInstructions) {
    return (
      <div className="h-full flex flex-col border-l-4 border-swiss-orange bg-white">
        <div className="px-4 py-4 border-b-2 border-swiss-ink bg-swiss-beige/30 shrink-0">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-swiss-sage mb-1">Controls</p>
          <h2 className="text-lg font-bold uppercase tracking-wide text-swiss-ink">Configuration</h2>
          <div className="mt-3 flex items-start gap-2 border-2 border-swiss-blue bg-swiss-blue/10 px-3 py-2">
            <svg className="w-4 h-4 text-swiss-blue shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm font-medium text-swiss-ink leading-snug">
              You are on the <strong>Instructions</strong> tab. Open a <strong>Variation</strong> tab to change model, system prompt, and company
              context for live chat.
            </p>
          </div>
        </div>
        <div className="flex-1 px-4 py-4 text-sm text-neutral-600 leading-relaxed">
          <strong className="text-swiss-ink">Base Case</strong> shows the locked benchmark (read-only). <strong className="text-swiss-ink">Variation</strong>{' '}
          tabs are where you run experiments against that benchmark.
        </div>
        <SimulatorTipRotator />
      </div>
    )
  }

  const selectedModel = MODELS.find(m => m.id === tab.modelId)
  const promptText = tab.isBaseCase ? BASE_CASE_SYSTEM_PROMPT : tab.systemPrompt
  const charCount = promptText.length
  const contextResolvedLen = tab.isBaseCase
    ? COMPANY_CONTEXT.length
    : resolveContextForRequest(tab.companyContext).length
  return (
    <div className="h-full flex flex-col border-l-4 border-swiss-orange bg-white">
      <div className="px-4 py-4 border-b-2 border-swiss-ink bg-swiss-beige/30 flex-shrink-0">
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-swiss-sage mb-1">Controls</p>
        <h2 className="text-lg font-bold uppercase tracking-wide text-swiss-ink">Configuration</h2>
        {tab.isBaseCase && (
          <div className="mt-3 flex items-center gap-2 border-2 border-swiss-orange bg-swiss-orange/10 px-3 py-2">
            <svg className="w-4 h-4 text-swiss-orange flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span className="text-sm font-semibold text-swiss-ink">Read-only · Base case</span>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin">
        <div className="px-4 divide-y-2 divide-swiss-ink/10">

          <section className="py-1">
            <SectionHeader
              icon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18" />
                </svg>
              }
              title="Model"
              badge={selectedModel?.name}
              open={modelOpen}
              onClick={() => setModelOpen(v => !v)}
            />
            {modelOpen && (
              <div className="pb-4">
                <ModelSelector
                  selectedModelId={tab.modelId}
                  onChange={(modelId) => onUpdateTab({ modelId })}
                  disabled={tab.isBaseCase}
                />
              </div>
            )}
          </section>

          <section className="py-1">
            <SectionHeader
              icon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              }
              title="System prompt"
              badge={`${charCount} chars`}
              open={promptOpen}
              onClick={() => setPromptOpen(v => !v)}
            />
            {promptOpen && (
              <div className="pb-4">
                {tab.isBaseCase ? (
                  <>
                    <div className="flex items-center gap-2 mb-2">
                      <svg className="w-4 h-4 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      <span className="text-sm text-neutral-600 font-medium">Locked for base case</span>
                    </div>
                    <textarea
                      value={BASE_CASE_SYSTEM_PROMPT}
                      readOnly
                      className="w-full min-h-[100px] text-sm font-mono border-2 border-neutral-300 rounded-sm px-3 py-3 bg-neutral-100 text-neutral-600 resize-none focus:outline-none leading-relaxed"
                    />
                  </>
                ) : (
                  <>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-neutral-600">Injected before every turn</span>
                      <span className="text-xs font-mono font-bold text-neutral-500 border border-neutral-300 px-2 py-1">{charCount} chars</span>
                    </div>
                    <textarea
                      value={tab.systemPrompt}
                      onChange={(e) => onUpdateTab({ systemPrompt: e.target.value })}
                      className="w-full min-h-[200px] text-sm font-mono border-2 border-swiss-ink rounded-sm px-3 py-3 bg-white text-swiss-ink resize-y focus:outline-none focus:ring-2 focus:ring-swiss-blue/30 focus:border-swiss-blue transition-all leading-relaxed placeholder:text-neutral-400"
                      placeholder="Write your system prompt here..."
                    />
                  </>
                )}
              </div>
            )}
          </section>

          <section className="py-1">
            <SectionHeader
              icon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              }
              title="Context doc"
              badge={!contextOpen ? (tab.isBaseCase ? 'Canonical' : `${contextResolvedLen} chars`) : undefined}
              open={contextOpen}
              onClick={() => setContextOpen(v => !v)}
            />
            {contextOpen && (
              <ContextDocOpenBody key={tab.id} tab={tab} onUpdateTab={onUpdateTab} />
            )}
          </section>

        </div>
      </div>

      <SimulatorTipRotator />
    </div>
  )
}
