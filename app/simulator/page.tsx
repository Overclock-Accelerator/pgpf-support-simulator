'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Tab, Message } from '@/lib/types'
import { BASE_CASE_SYSTEM_PROMPT, BASE_CASE_HISTORY } from '@/lib/base-case'
import { BASE_CASE_MODEL_ID, MODELS } from '@/lib/models'
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
        const withoutBase = parsed.filter((t) => !t.isBaseCase)
        setTabs([BASE_CASE_TAB, ...withoutBase])
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

  useEffect(() => {
    if (!mounted) return
    const nonBase = tabs.filter((t) => !t.isBaseCase)
    localStorage.setItem('pgpf_tabs', JSON.stringify(nonBase))
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
  const activeModel = MODELS.find(m => m.id === activeTab.modelId)
  const experimentCount = tabs.filter(t => !t.isBaseCase).length

  function addTab() {
    const newTab: Tab = {
      id: generateId(),
      name: `Experiment ${tabs.filter((t) => !t.isBaseCase).length + 1}`,
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
    <div className="h-screen flex flex-col bg-zinc-950">
      {/* Header */}
      <header className="h-[52px] border-b border-zinc-800 bg-zinc-950 flex items-center justify-between px-4 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-7 h-7 bg-amber-500 rounded-lg flex-shrink-0">
            <span className="text-sm">🐾</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-white text-sm tracking-tight">PrettyGoodPetFoods</span>
            <span className="hidden sm:block text-[11px] text-zinc-500 font-medium bg-zinc-800 px-2 py-0.5 rounded-full">
              Support Simulator
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Active model pill — desktop only */}
          {!activeTab.isBaseCase && activeModel && (
            <div className="hidden md:flex items-center gap-1.5 bg-zinc-800 border border-zinc-700 rounded-full px-3 py-1">
              <span className={`w-1.5 h-1.5 rounded-full ${
                activeModel.tier === 'fast' ? 'bg-green-400' :
                activeModel.tier === 'balanced' ? 'bg-blue-400' : 'bg-purple-400'
              }`} />
              <span className="text-[11px] text-zinc-300 font-medium">{activeModel.name}</span>
            </div>
          )}

          {/* Experiment count — desktop */}
          {experimentCount > 0 && (
            <div className="hidden md:flex items-center gap-1.5">
              <span className="text-[11px] text-zinc-500">
                {experimentCount} experiment{experimentCount !== 1 ? 's' : ''}
              </span>
            </div>
          )}

          {/* Tagline — large screens */}
          <span className="text-xs italic text-zinc-600 hidden lg:block">
            "If they ate it. It must have been pretty good!"
          </span>

          {/* Mobile config toggle */}
          <button
            onClick={() => setConfigOpen((v) => !v)}
            className="lg:hidden flex items-center gap-1.5 text-xs font-medium text-zinc-400 hover:text-amber-400 border border-zinc-700 hover:border-amber-500/50 rounded-lg px-2.5 py-1.5 transition-all"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
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
        {/* Desktop sidebar */}
        <div className="hidden lg:flex lg:flex-col w-96 border-r border-zinc-800 overflow-y-auto flex-shrink-0">
          <ConfigPanel tab={activeTab} onUpdateTab={updateTab} />
        </div>

        {/* Mobile overlay */}
        {configOpen && (
          <>
            <div
              className="lg:hidden fixed inset-0 bg-black/50 z-30 backdrop-blur-sm"
              onClick={() => setConfigOpen(false)}
            />
            <div className="lg:hidden fixed inset-y-0 left-0 w-[85vw] max-w-sm bg-zinc-950 z-40 overflow-y-auto shadow-2xl shadow-black/40">
              <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
                <span className="text-sm font-semibold text-zinc-200">Configuration</span>
                <button
                  onClick={() => setConfigOpen(false)}
                  className="text-zinc-500 hover:text-zinc-300 transition-colors w-7 h-7 flex items-center justify-center rounded-lg hover:bg-zinc-800"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <ConfigPanel tab={activeTab} onUpdateTab={updateTab} />
            </div>
          </>
        )}

        {/* Chat area */}
        <div className="flex-1 flex flex-col overflow-hidden bg-white">
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
