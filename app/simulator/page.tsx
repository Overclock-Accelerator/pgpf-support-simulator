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

const BASE_CASE_TAB: Tab = {
  id: 'base-case',
  name: '🔒 Base Case',
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

  // Auth check + load from localStorage
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
        // Always ensure base case is first
        const withoutBase = parsed.filter((t) => !t.isBaseCase)
        setTabs([BASE_CASE_TAB, ...withoutBase])
        // Restore active tab if valid
        const savedActiveId = localStorage.getItem('pgpf_active_tab')
        if (savedActiveId && [...withoutBase].some((t) => t.id === savedActiveId)) {
          setActiveTabId(savedActiveId)
        }
      } catch {
        // ignore parse errors
      }
    }
    setMounted(true)
  }, [router])

  // Save to localStorage when tabs change
  useEffect(() => {
    if (!mounted) return
    const nonBase = tabs.filter((t) => !t.isBaseCase)
    localStorage.setItem('pgpf_tabs', JSON.stringify(nonBase))
    localStorage.setItem('pgpf_active_tab', activeTabId)
  }, [tabs, activeTabId, mounted])

  // Listen for clear chat event from ChatPanel
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
      name: `Tab ${tabs.filter((t) => !t.isBaseCase).length + 1}`,
      systemPrompt: BASE_CASE_SYSTEM_PROMPT,
      modelId: BASE_CASE_MODEL_ID,
      messages: [],
      isBaseCase: false,
    }
    setTabs((prev) => [...prev, newTab])
    setActiveTabId(newTab.id)
  }

  function deleteTab(id: string) {
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
              ? { ...t, messages: [...t.messages, userMessage, assistantMessage].filter(
                  (m, i, arr) => arr.findIndex((x) => x.id === m.id) === i
                ) }
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
              ? { ...t, messages: [...t.messages, userMessage, errorMessage].filter(
                  (m, i, arr) => arr.findIndex((x) => x.id === m.id) === i
                ) }
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
    <div className="h-screen flex flex-col bg-[#FDFAF5]">
      {/* Header */}
      <header className="h-[56px] border-b border-gray-200/60 bg-white flex items-center justify-between px-4 flex-shrink-0 shadow-sm">
        <div className="flex items-center gap-2.5">
          <img src="/hero.png" alt="Pet crew" className="h-8 w-8 rounded-lg object-cover" />
          <div>
            <span className="font-bold text-gray-800 text-sm">PrettyGoodPetFoods</span>
            <span className="text-xs text-gray-400 ml-1.5 hidden sm:inline">Support Simulator</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs italic text-gray-400 hidden md:block">
            "If they ate it. It must have been pretty good!"
          </span>
          {/* Mobile config toggle */}
          <button
            onClick={() => setConfigOpen((v) => !v)}
            className="lg:hidden flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-amber-600 border border-gray-200 hover:border-amber-300 rounded-lg px-2.5 py-1.5 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
            Config
          </button>
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
        {/* Config panel — sidebar on desktop, overlay on mobile */}
        {/* Desktop sidebar */}
        <div className="hidden lg:block w-80 border-r border-gray-200/60 overflow-y-auto bg-white/80 flex-shrink-0">
          <ConfigPanel tab={activeTab} onUpdateTab={updateTab} />
        </div>
        {/* Mobile overlay */}
        {configOpen && (
          <>
            <div
              className="lg:hidden fixed inset-0 bg-black/20 z-30"
              onClick={() => setConfigOpen(false)}
            />
            <div className="lg:hidden fixed inset-y-0 left-0 w-[85vw] max-w-sm bg-white z-40 overflow-y-auto shadow-xl">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                <span className="text-sm font-semibold text-gray-700">Configuration</span>
                <button
                  onClick={() => setConfigOpen(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
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

        {/* Chat area */}
        <div className="flex-1 flex flex-col overflow-hidden">
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
