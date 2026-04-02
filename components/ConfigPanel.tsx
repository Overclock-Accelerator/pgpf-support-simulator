'use client'

import { useState, useCallback } from 'react'
import { Tab } from '@/lib/types'
import { BASE_CASE_SYSTEM_PROMPT } from '@/lib/base-case'
import { COMPANY_CONTEXT, resolveContextForRequest } from '@/lib/company-context'
import { MODELS } from '@/lib/models'
import { SAMPLE_CONFIGS, SampleConfig } from '@/lib/sample-configs'
import ModelSelector from './ModelSelector'
import SimulatorTipRotator from './SimulatorTipRotator'

const INSTRUCTOR_PASSWORD = 'OpsFTW'

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
            <p className="text-sm text-neutral-600 font-medium">Canonical catalog &middot; not editable</p>
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
              Injected with every message &middot; leave empty to restore default catalog
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

function InstructorPanel({
  tab,
  onUpdateTab,
}: {
  tab: Tab
  onUpdateTab: (updates: Partial<Tab>) => void
}) {
  const [password, setPassword] = useState('')
  const [authenticated, setAuthenticated] = useState(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('pgpf_instructor') === 'true'
    }
    return false
  })
  const [error, setError] = useState(false)
  const [loadedConfigId, setLoadedConfigId] = useState<string | null>(null)

  function handleAuth(e: React.FormEvent) {
    e.preventDefault()
    if (password === INSTRUCTOR_PASSWORD) {
      sessionStorage.setItem('pgpf_instructor', 'true')
      setAuthenticated(true)
      setError(false)
    } else {
      setError(true)
      setPassword('')
    }
  }

  function loadSampleConfig(config: SampleConfig) {
    onUpdateTab({ systemPrompt: config.systemPrompt, modelId: config.modelId })
    setLoadedConfigId(config.id)
  }

  if (!authenticated) {
    return (
      <div className="pb-4">
        <p className="text-xs text-neutral-500 mb-3 leading-relaxed">
          Instructor tools include reference configurations that show optimized solutions. Not for student use.
        </p>
        <form onSubmit={handleAuth} className="flex gap-2">
          <input
            type="password"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setError(false) }}
            placeholder="Instructor password"
            className="flex-1 text-sm border-2 border-swiss-ink px-3 py-2 focus:outline-none focus:border-swiss-blue bg-white placeholder:text-neutral-400"
          />
          <button
            type="submit"
            disabled={!password}
            className="text-xs font-bold uppercase tracking-wider border-2 border-swiss-ink px-3 py-2 bg-white hover:bg-swiss-blue hover:text-white hover:border-swiss-blue transition-colors disabled:opacity-40"
          >
            Unlock
          </button>
        </form>
        {error && (
          <p className="text-xs text-red-600 font-medium mt-2">Incorrect password.</p>
        )}
      </div>
    )
  }

  return (
    <div className="pb-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs text-neutral-500 leading-relaxed">
          Load a reference configuration to demo during class. Each illustrates a specific concept.
        </p>
        <button
          type="button"
          onClick={() => {
            sessionStorage.removeItem('pgpf_instructor')
            setAuthenticated(false)
          }}
          className="shrink-0 ml-3 text-[10px] font-bold uppercase tracking-wider text-neutral-400 hover:text-neutral-700 transition-colors"
        >
          Lock
        </button>
      </div>
      <div className="space-y-2">
        {SAMPLE_CONFIGS.map((config, index) => {
          const model = MODELS.find(m => m.id === config.modelId)
          const isLoaded = loadedConfigId === config.id
          return (
            <div
              key={config.id}
              className={`border-2 p-3 transition-colors ${isLoaded ? 'border-swiss-blue bg-swiss-blue/5' : 'border-neutral-200 bg-swiss-beige/20'}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[10px] font-mono font-bold text-neutral-400 shrink-0">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <p className="text-sm font-bold text-swiss-ink truncate">{config.name}</p>
                    {isLoaded && (
                      <span className="shrink-0 text-[10px] font-bold uppercase tracking-wider text-swiss-blue border border-swiss-blue px-1.5 py-0.5">
                        Loaded
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-neutral-500 leading-snug mb-2">{config.lesson}</p>
                  {model && (
                    <span className="inline-block text-[10px] font-mono font-bold uppercase tracking-wider border border-neutral-300 px-1.5 py-0.5 text-neutral-600 bg-white">
                      {model.name} &middot; {model.pricePer1M < 0.10 ? `$${model.pricePer1M.toFixed(3)}` : `$${model.pricePer1M.toFixed(2)}`}/1M
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => loadSampleConfig(config)}
                  className={`shrink-0 text-xs font-bold uppercase tracking-wider border-2 px-2 py-1.5 transition-colors ${
                    isLoaded
                      ? 'border-swiss-blue text-swiss-blue bg-swiss-blue/5 cursor-default'
                      : 'border-swiss-ink bg-white hover:bg-swiss-blue hover:text-white hover:border-swiss-blue'
                  }`}
                  disabled={isLoaded}
                >
                  {isLoaded ? 'Active' : 'Load'}
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function ConfigPanel({ tab, onUpdateTab }: ConfigPanelProps) {
  const [contextOpen, setContextOpen] = useState(false)
  const [promptOpen, setPromptOpen] = useState(false)
  const [modelOpen, setModelOpen] = useState(false)
  const [instructorOpen, setInstructorOpen] = useState(false)

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
            <span className="text-sm font-semibold text-swiss-ink">Read-only &middot; Base case</span>
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

          {!tab.isBaseCase && (
            <section className="py-1">
              <SectionHeader
                icon={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                }
                title="Instructor tools"
                open={instructorOpen}
                onClick={() => setInstructorOpen(v => !v)}
              />
              {instructorOpen && (
                <InstructorPanel tab={tab} onUpdateTab={onUpdateTab} />
              )}
            </section>
          )}

        </div>
      </div>

      <SimulatorTipRotator />
    </div>
  )
}
