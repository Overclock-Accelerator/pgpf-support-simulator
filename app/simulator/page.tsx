'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Tab, Message } from '@/lib/types'
import { BASE_CASE_SYSTEM_PROMPT, BASE_CASE_HISTORY } from '@/lib/base-case'
import { BASE_CASE_MODEL_ID } from '@/lib/models'
import TabBar from '@/components/TabBar'
import ConfigPanel from '@/components/ConfigPanel'
import ChatPanel from '@/components/ChatPanel'

function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36)
}

const INSTRUCTIONS_TAB: Tab = {
  id: 'instructions',
  name: 'Instructions',
  systemPrompt: '',
  modelId: BASE_CASE_MODEL_ID,
  messages: [],
  isBaseCase: false,
  isInstructions: true,
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
  const [tabs, setTabs] = useState<Tab[]>([INSTRUCTIONS_TAB, BASE_CASE_TAB])
  const [activeTabId, setActiveTabId] = useState<string>('instructions')
  const [isLoading, setIsLoading] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [configOpen, setConfigOpen] = useState(false)

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
        const variationsOnly = parsed.filter((t) => !t.isBaseCase && !t.isInstructions)
        setTabs([INSTRUCTIONS_TAB, BASE_CASE_TAB, ...variationsOnly])
        const savedActiveId = localStorage.getItem('pgpf_active_tab')
        const restorableIds = new Set([
          'instructions',
          'base-case',
          ...variationsOnly.map((t) => t.id),
        ])
        if (savedActiveId && restorableIds.has(savedActiveId)) {
          setActiveTabId(savedActiveId)
        }
      } catch {
        // ignore parse errors
      }
    }
    setMounted(true)
  }, [router])

  useEffect(() => {
    if (!mounted) return
    const persisted = tabs.filter((t) => !t.isBaseCase && !t.isInstructions)
    localStorage.setItem('pgpf_tabs', JSON.stringify(persisted))
    localStorage.setItem('pgpf_active_tab', activeTabId)
  }, [tabs, activeTabId, mounted])

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
      name: `Variation ${tabs.filter((t) => !t.isBaseCase && !t.isInstructions).length + 1}`,
      systemPrompt: BASE_CASE_SYSTEM_PROMPT,
      modelId: BASE_CASE_MODEL_ID,
      messages: [],
      isBaseCase: false,
    }
    setTabs((prev) => [...prev, newTab])
    setActiveTabId(newTab.id)
  }

  function deleteTab(id: string) {
    if (id === 'instructions' || id === 'base-case') return
    setTabs((prev) => {
      const filtered = prev.filter((t) => t.id !== id)
      if (activeTabId === id) {
        setActiveTabId(filtered[filtered.length - 1]?.id ?? 'instructions')
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
      if (!activeTab || activeTab.isBaseCase || activeTab.isInstructions) return

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

          <div className="flex items-center gap-3 flex-shrink-0">
            <button
              onClick={() => setConfigOpen((v) => !v)}
              className="lg:hidden flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-swiss-ink border-2 border-swiss-ink px-3 py-2 bg-white hover:bg-swiss-beige/50 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Config
            </button>

            <span className="hidden sm:inline text-right text-xs text-neutral-600 italic leading-snug max-w-[11rem] md:max-w-[16rem] lg:max-w-md shrink-0">
              &ldquo;If your pets ate it... It must have been &lsquo;Pretty Good!&rsquo;&rdquo;
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
      />

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
