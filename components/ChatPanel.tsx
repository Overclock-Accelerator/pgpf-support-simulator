'use client'

import { useState, useRef, useEffect } from 'react'
import { Tab, Message } from '@/lib/types'

interface ChatPanelProps {
  tab: Tab
  onSendMessage: (content: string) => void
  isLoading: boolean
}

export default function ChatPanel({ tab, onSendMessage, isLoading }: ChatPanelProps) {
  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [tab.messages, isLoading])

  function handleSend() {
    const trimmed = input.trim()
    if (!trimmed || isLoading) return
    onSendMessage(trimmed)
    setInput('')
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  function handleTextareaChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setInput(e.target.value)
    const ta = e.target
    ta.style.height = 'auto'
    const lineHeight = 24
    const maxLines = 4
    const maxHeight = lineHeight * maxLines
    ta.style.height = Math.min(ta.scrollHeight, maxHeight) + 'px'
  }

  function handleNewChat() {
    if (window.confirm('Clear this conversation? This cannot be undone.')) {
      // We signal via a special message with empty content and a flag
      // Actually we'll use a workaround: onSendMessage with a special command
      // Better: expose a prop — but per spec just clears messages via parent
      // We'll dispatch a custom event to trigger clear from parent
      window.dispatchEvent(new CustomEvent('pgpf-clear-chat', { detail: { tabId: tab.id } }))
    }
  }

  function handleExport() {
    const lines: string[] = [
      `Tab: ${tab.name}`,
      `Model: ${tab.modelId}`,
      `System Prompt: ${tab.systemPrompt}`,
      '============================',
      'CONVERSATION:',
    ]
    for (const msg of tab.messages) {
      const prefix = msg.role === 'user' ? 'USER' : 'BOT'
      lines.push(`${prefix}: ${msg.content}`)
    }
    const content = lines.join('\n')
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${tab.name.replace(/\s+/g, '-')}-conversation.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-white/80 flex-shrink-0">
        <div>
          <p className="font-bold text-gray-800">🐾 PrettyGoodPetFoods Support</p>
          <p className="text-xs text-gray-400 italic">"If they ate it. It must have been pretty good!"</p>
        </div>
        {!tab.isBaseCase && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleNewChat}
              className="text-xs text-gray-500 hover:text-amber-600 border border-gray-200 hover:border-amber-300 rounded px-2 py-1 transition-colors"
            >
              New Chat 🔄
            </button>
            <button
              onClick={handleExport}
              className="text-xs text-gray-500 hover:text-amber-600 border border-gray-200 hover:border-amber-300 rounded px-2 py-1 transition-colors"
            >
              Export 💾
            </button>
          </div>
        )}
      </div>

      {/* Base case banner */}
      {tab.isBaseCase && (
        <div className="sticky top-0 z-10 bg-amber-50 border-b border-amber-200 px-4 py-2 text-sm text-amber-800 flex-shrink-0">
          ⚠️ <strong>Base Case</strong> — These are real support conversations from our launch week. Your mission: build something better.
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
        {tab.messages.length === 0 && !tab.isBaseCase && (
          <div className="flex-1 flex items-center justify-center text-gray-400 text-sm italic">
            Start a conversation to test your prompt! 🐾
          </div>
        )}
        {tab.messages.map((msg: Message) => (
          <div key={msg.id} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
            <div
              className={`max-w-[80%] px-4 py-2 rounded-2xl text-sm whitespace-pre-wrap ${
                msg.role === 'user'
                  ? 'bg-amber-100 border border-amber-200 text-gray-800'
                  : 'bg-white border border-gray-200 shadow-sm text-gray-800'
              }`}
            >
              {msg.content}
            </div>
            {msg.role === 'assistant' && (msg.latencyMs !== undefined || msg.costUsd !== undefined) && (
              <p className="text-xs text-gray-400 mt-1 px-1">
                {msg.latencyMs !== undefined && `⏱ ${(msg.latencyMs / 1000).toFixed(1)}s`}
                {msg.latencyMs !== undefined && msg.costUsd !== undefined && ' · '}
                {msg.costUsd !== undefined && `💰 $${msg.costUsd.toFixed(4)}`}
              </p>
            )}
          </div>
        ))}
        {isLoading && (
          <div className="flex items-start">
            <div className="bg-white border border-gray-200 shadow-sm rounded-2xl px-4 py-3 text-sm text-gray-400 italic">
              Thinking...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      {!tab.isBaseCase && (
        <div className="flex-shrink-0 border-t border-gray-100 bg-white/80 px-4 py-3">
          <div className="flex items-end gap-2">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={handleTextareaChange}
              onKeyDown={handleKeyDown}
              placeholder="Type a customer message... 🐾"
              rows={1}
              disabled={isLoading}
              className="flex-1 border border-amber-200 rounded-xl px-4 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-amber-300 disabled:opacity-50 overflow-hidden"
              style={{ minHeight: '40px', maxHeight: '96px' }}
            />
            <button
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className="bg-amber-500 hover:bg-amber-600 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl px-4 py-2 text-sm font-semibold transition-colors flex items-center gap-1 flex-shrink-0"
              style={{ minHeight: '40px' }}
            >
              {isLoading ? (
                <span className="inline-block animate-spin">⟳</span>
              ) : (
                'Send'
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
