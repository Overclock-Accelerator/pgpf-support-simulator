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
      <header className="h-[60px] border-b border-amber-200 bg-white/80 flex items-center justify-between px-4 flex-shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-lg">🐾</span>
          <span className="font-bold text-amber-700">PrettyGoodPetFoods</span>
          <span className="text-sm text-gray-400 ml-1">Support Simulator</span>
        </div>
        <div className="flex items-center gap-3">
          <img src="/hero.png" alt="Pet crew" className="h-10 object-contain" />
          <span className="text-xs italic text-gray-500 hidden sm:block">
            "If they ate it. It must have been pretty good!"
          </span>
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

      <div className="flex flex-1 overflow-hidden">
        <div className="w-80 border-r border-amber-100 overflow-y-auto bg-white/60 flex-shrink-0">
          <ConfigPanel tab={activeTab} onUpdateTab={updateTab} />
        </div>
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
