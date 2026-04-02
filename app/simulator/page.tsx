'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Tab, Message } from '@/lib/types'
import { BASE_CASE_SYSTEM_PROMPT, BASE_CASE_HISTORY } from '@/lib/base-case'
import { BASE_CASE_MODEL_ID } from '@/lib/models'
import TabBar from '@/components/TabBar'
import ConfigPanel from '@/components/ConfigPanel'
import ChatPanel from '@/components/ChatPanel'
import ExerciseInstructions from '@/components/ExerciseInstructions'

function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36)
}

const BASE_CASE_TAB: Tab = {
  id: 'base-case',
  name: 'Base Case',
  systemPrompt: BASE_CASE_SYSTEM_PROMPT,
  modelId: BASE_CASE_MODEL_ID,
  messages: BASE_CASE_HISTORY,
  isBaseCase: true,
}

export default function SimulatorPage() {
  const router = useRouter()
  const [tabs, setTabs] = useState<Tab[]>([BASE_CASE_TAB])
  const [activeTabId, setActiveTabId] = useState<string>('base-case')
  const [isLoading, setIsLoading] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [configOpen, setConfigOpen] = useState(false)
  const [instructionsOpen, setInstructionsOpen] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (localStorage.getItem('pgpf_auth') !== 'true') {
      router.push('/')
      return
    }
    const saved = localStorage.getItem('pgpf_tabs')
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as Tab[]
        const variationsOnly = parsed.filter((t) => !t.isBaseCase)
        setTabs([BASE_CASE_TAB, ...variationsOnly])
        const savedActiveId = localStorage.getItem('pgpf_active_tab')
        const restorableIds = new Set(['base-case', ...variationsOnly.map((t) => t.id)])
        if (savedActiveId && restorableIds.has(savedActiveId)) {
          setActiveTabId(savedActiveId)
        }
      } catch {
        // ignore parse errors
      }
    }
    const seenInstructions = localStorage.getItem('pgpf_seen_instructions')
    if (!seenInstructions) setInstructionsOpen(true)
    setMounted(true)
  }, [router])

  useEffect(() => {
    if (!mounted) return
    const persisted = tabs.filter((t) => !t.isBaseCase)
    localStorage.setItem('pgpf_tabs', JSON.stringify(persisted))
    localStorage.setItem('pgpf_active_tab', activeTabId)
  }, [tabs, activeTabId, mounted])

  function closeInstructions() {
    setInstructionsOpen(false)
    localStorage.setItem('pgpf_seen_instructions', 'true')
  }

  useEffect(() => {
    function handleClear(e: Event) {
      const { tabId } = (e as CustomEvent).detail
      setTabs((prev) =>
        prev.map((t) => (t.id === tabId ? { ...t, messages: [] } : t))
      )
    }
    window.addEventListener('pgpf-clear-chat', handleClear)
    return () => window.removeEventListener('pgpf-clear-chat', handleClear)
  }, [])

  const activeTab = tabs.find((t) => t.id === activeTabId) ?? tabs[0]

  function addTab() {
    const newTab: Tab = {
      id: generateId(),
      name: `Variation ${tabs.filter((t) => !t.isBaseCase).length + 1}`,
      systemPrompt: BASE_CASE_SYSTEM_PROMPT,
      modelId: BASE_CASE_MODEL_ID,
      messages: [],
      isBaseCase: false,
    }
    setTabs((prev) => [...prev, newTab])
    setActiveTabId(newTab.id)
  }

  function deleteTab(id: string) {
    if (id === 'base-case') return
    setTabs((prev) => {
      const filtered = prev.filter((t) => t.id !== id)
      if (activeTabId === id) {
        setActiveTabId(filtered[filtered.length - 1]?.id ?? 'base-case')
      }
      return filtered
    })
  }

  function renameTab(id: string, name: string) {
    setTabs((prev) => prev.map((t) => (t.id === id ? { ...t, name } : t)))
  }

  function updateTab(updates: Partial<Tab>) {
    setTabs((prev) =>
      prev.map((t) => (t.id === activeTabId ? { ...t, ...updates } : t))
    )
  }

  const sendMessage = useCallback(
    async (content: string) => {
      if (!activeTab || activeTab.isBaseCase) return

      const userMessage: Message = {
        id: generateId(),
        role: 'user',
        content,
        timestamp: Date.now(),
      }

      setTabs((prev) =>
        prev.map((t) =>
          t.id === activeTab.id
            ? { ...t, messages: [...t.messages, userMessage] }
            : t
        )
      )
      setIsLoading(true)

      try {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: [...activeTab.messages, userMessage],
            systemPrompt: activeTab.systemPrompt,
            modelId: activeTab.modelId,
            companyContext: activeTab.companyContext,
          }),
        })
        const data = await res.json()
        const assistantMessage: Message = {
          id: generateId(),
          role: 'assistant',
          content: data.content,
          latencyMs: data.latencyMs,
          costUsd: data.costUsd,
          timestamp: Date.now(),
        }
        setTabs((prev) =>
          prev.map((t) =>
            t.id === activeTab.id
              ? {
                  ...t,
                  messages: [...t.messages, userMessage, assistantMessage].filter(
                    (m, i, arr) => arr.findIndex((x) => x.id === m.id) === i
                  ),
                }
              : t
          )
        )
      } catch (err) {
        console.error('Chat error:', err)
        const errorMessage: Message = {
          id: generateId(),
          role: 'assistant',
          content: 'Sorry, something went wrong. Please try again.',
          timestamp: Date.now(),
        }
        setTabs((prev) =>
          prev.map((t) =>
            t.id === activeTab.id
              ? {
                  ...t,
                  messages: [...t.messages, userMessage, errorMessage].filter(
                    (m, i, arr) => arr.findIndex((x) => x.id === m.id) === i
                  ),
                }
              : t
          )
        )
      } finally {
        setIsLoading(false)
      }
    },
    [activeTab]
  )

  if (!mounted) return null

  return (
    <div className="h-screen flex flex-col bg-swiss-paper">
      <header className="min-h-14 border-b-2 border-swiss-ink bg-white flex items-stretch shrink-0 py-2 sm:py-2.5">
        <div className="w-1.5 bg-swiss-orange shrink-0" aria-hidden />
        <div className="flex flex-1 items-center justify-between gap-3 px-4 min-w-0">
          <div
            className="min-w-0 flex-1 flex items-center gap-2.5 sm:gap-3"
            aria-label="PGPF Pretty Good Pet Foods, Customer Support Simulator"
          >
            <span className="inline-flex shrink-0 items-center bg-swiss-blue px-2.5 py-1.5 text-white text-base sm:text-lg font-bold tracking-[0.18em] leading-none">
              PGPF
            </span>
            <div className="min-w-0 flex flex-col gap-0.5 justify-center">
              <span className="text-xs sm:text-sm font-semibold text-swiss-ink tracking-tight leading-tight">
                &ldquo;Pretty Good Pet Foods&rdquo;
              </span>
              <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.2em] text-swiss-blue leading-tight m-0">
                Customer Support Simulator
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => setConfigOpen((v) => !v)}
              className="lg:hidden flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-swiss-ink border-2 border-swiss-ink px-3 py-2 bg-white hover:bg-swiss-beige/50 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="hidden sm:inline">Config</span>
            </button>

            <span className="hidden lg:inline text-right text-xs text-neutral-600 italic leading-snug whitespace-nowrap shrink-0">
              &ldquo;Look, if your pet ate it&hellip; then it must have been Pretty Good!&rdquo;
            </span>
          </div>
        </div>
      </header>

      <TabBar
        tabs={tabs}
        activeTabId={activeTabId}
        onTabChange={setActiveTabId}
        onAddTab={addTab}
        onDeleteTab={deleteTab}
        onRenameTab={renameTab}
        onOpenInstructions={() => setInstructionsOpen(true)}
      />

      {instructionsOpen && (
        <>
          <div
            className="fixed inset-0 bg-swiss-ink/50 z-50"
            onClick={closeInstructions}
          />
          <div className="fixed top-8 sm:top-14 left-1/2 -translate-x-1/2 z-50 flex flex-col bg-white border-2 border-swiss-ink shadow-[8px_8px_0_0_rgba(12,12,12,0.18)] w-[calc(100vw-2rem)] max-w-[600px] max-h-[calc(100vh-5rem)]">
            <div className="flex items-stretch border-b-2 border-swiss-ink shrink-0">
              <div className="w-2 bg-swiss-blue shrink-0" aria-hidden />
              <div className="flex flex-1 items-center gap-4 px-4 sm:px-6 py-4 min-w-0">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center border-2 border-swiss-ink bg-swiss-blue/15">
                  <svg className="h-5 w-5 text-swiss-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-swiss-sage">Exercise brief · read-only</p>
                  <h2 className="mt-0.5 text-lg font-bold uppercase tracking-wide text-swiss-ink sm:text-xl">
                    How to use this simulator
                  </h2>
                </div>
                <button
                  onClick={closeInstructions}
                  className="ml-2 shrink-0 w-10 h-10 flex items-center justify-center border-2 border-swiss-ink bg-white hover:bg-swiss-ink hover:text-white transition-colors"
                  aria-label="Close instructions"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto px-6 sm:px-10 py-8">
              <ExerciseInstructions />
            </div>
            <div className="shrink-0 border-t-2 border-swiss-ink px-4 sm:px-8 py-4 flex justify-end bg-swiss-beige/30">
              <button
                onClick={closeInstructions}
                className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider bg-swiss-blue text-white border-2 border-swiss-blue px-5 py-2.5 hover:bg-swiss-ink hover:border-swiss-ink transition-colors"
              >
                Got it — show the simulator
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
            </div>
          </div>
        </>
      )}

      <div className="flex flex-1 overflow-hidden relative">
        <div className="hidden lg:flex lg:flex-col w-[22rem] xl:w-96 border-r-2 border-swiss-ink overflow-y-auto flex-shrink-0 bg-white">
          <ConfigPanel tab={activeTab} onUpdateTab={updateTab} />
        </div>

        {configOpen && (
          <>
            <div
              className="lg:hidden fixed inset-0 bg-swiss-ink/40 z-30"
              onClick={() => setConfigOpen(false)}
            />
            <div className="lg:hidden fixed inset-y-0 left-0 w-[88vw] max-w-md bg-white z-40 overflow-y-auto border-r-2 border-swiss-ink shadow-xl">
              <div className="flex items-center justify-between px-4 py-4 border-b-2 border-swiss-ink bg-swiss-blue text-white">
                <span className="text-sm font-bold uppercase tracking-[0.2em]">Configuration</span>
                <button
                  onClick={() => setConfigOpen(false)}
                  className="w-9 h-9 flex items-center justify-center border-2 border-white/80 hover:bg-white/10 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <ConfigPanel tab={activeTab} onUpdateTab={updateTab} />
            </div>
          </>
        )}

        <div className="flex-1 flex flex-col overflow-hidden bg-swiss-dots min-w-0">
          <ChatPanel
            tab={activeTab}
            onSendMessage={sendMessage}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  )
}
