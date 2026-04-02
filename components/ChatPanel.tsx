'use client'

import { useState, useRef, useEffect } from 'react'
import { Tab, Message } from '@/lib/types'
import { MODELS } from '@/lib/models'

interface ChatPanelProps {
  tab: Tab
  onSendMessage: (content: string) => void
  isLoading: boolean
}

const SUGGESTED_MESSAGES = [
  'What food is best for a senior cat?',
  "I'd like to return an order",
  "What's the difference between your premium and standard lines?",
]

export default function ChatPanel({ tab, onSendMessage, isLoading }: ChatPanelProps) {
  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const selectedModel = MODELS.find(m => m.id === tab.modelId)
  const botName = selectedModel?.name ?? 'AI'

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
    ta.style.height = Math.min(ta.scrollHeight, 96) + 'px'
  }

  function handleNewChat() {
    if (window.confirm('Clear this conversation? This cannot be undone.')) {
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
    const blob = new Blob([lines.join('\n')], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${tab.name.replace(/\s+/g, '-')}-conversation.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Panel header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 bg-white flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-800 leading-none">
              {tab.isBaseCase ? 'Base Case' : 'Chat'}
            </p>
            <p className="text-[11px] text-gray-400 leading-none mt-0.5">
              {tab.isBaseCase ? 'Read-only · Launch week conversations' : botName}
            </p>
          </div>
        </div>

        {!tab.isBaseCase && (
          <div className="flex items-center gap-1">
            <button
              onClick={handleNewChat}
              className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg px-2.5 py-1.5 transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Clear
            </button>
            <button
              onClick={handleExport}
              className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg px-2.5 py-1.5 transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export
            </button>
          </div>
        )}
      </div>

      {/* Base case educational banner */}
      {tab.isBaseCase && (
        <div className="flex-shrink-0 border-b border-orange-200 bg-gradient-to-r from-orange-50 to-amber-50 px-5 py-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-orange-100 border border-orange-200 flex items-center justify-center flex-shrink-0">
              <svg className="w-4.5 h-4.5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-bold text-orange-900 mb-0.5">Base Case — Launch Week Conversations</p>
              <p className="text-xs text-orange-700 leading-relaxed">
                These are unmodified conversations showing AI failure patterns: wrong product recommendations, missed policies, off-topic rambling.{' '}
                <strong className="text-orange-900">Your mission:</strong> create a new experiment tab, tune the system prompt and model, and beat this.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-5">
        {tab.messages.length === 0 && !tab.isBaseCase && (
          <div className="flex flex-col items-center justify-center gap-4 text-center py-10 flex-1">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center">
              <svg className="w-7 h-7 text-amber-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-700">Ready to test</p>
              <p className="text-xs text-gray-400 mt-1 leading-relaxed max-w-[200px]">
                Send a message and see how your configured AI responds
              </p>
            </div>
            <div className="flex flex-col gap-2 w-full max-w-xs">
              {SUGGESTED_MESSAGES.map((msg) => (
                <button
                  key={msg}
                  onClick={() => {
                    setInput(msg)
                    textareaRef.current?.focus()
                  }}
                  className="text-xs text-left text-gray-500 bg-gray-50 hover:bg-amber-50 hover:text-amber-700 border border-gray-200 hover:border-amber-200 rounded-xl px-3.5 py-2.5 transition-all"
                >
                  {msg}
                </button>
              ))}
            </div>
          </div>
        )}

        {tab.messages.map((msg: Message) => (
          <MessageBubble key={msg.id} msg={msg} botName={botName} />
        ))}

        {isLoading && (
          <div className="flex flex-col items-start gap-1.5">
            <p className="text-[11px] font-medium text-gray-400 px-1">{botName}</p>
            <div className="bg-gray-50 border border-gray-100 rounded-2xl rounded-bl-sm px-4 py-3.5 flex items-center gap-1.5">
              {[0, 150, 300].map((delay) => (
                <span
                  key={delay}
                  className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce"
                  style={{ animationDelay: `${delay}ms`, animationDuration: '900ms' }}
                />
              ))}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      {!tab.isBaseCase && (
        <div className="flex-shrink-0 border-t border-gray-100 bg-white px-4 py-3.5">
          <div className="flex items-end gap-2.5 bg-gray-50 border border-gray-200 rounded-2xl px-4 py-2.5 focus-within:border-amber-300 focus-within:bg-white focus-within:ring-2 focus-within:ring-amber-100 transition-all">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={handleTextareaChange}
              onKeyDown={handleKeyDown}
              placeholder="Type a customer message..."
              rows={1}
              disabled={isLoading}
              className="flex-1 bg-transparent text-sm resize-none focus:outline-none disabled:opacity-50 overflow-hidden text-gray-800 placeholder:text-gray-400 leading-relaxed"
              style={{ minHeight: '24px', maxHeight: '96px' }}
            />
            <button
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className="bg-amber-500 hover:bg-amber-600 active:bg-amber-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl w-9 h-9 flex items-center justify-center flex-shrink-0 transition-all shadow-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
          <p className="text-[10px] text-gray-400 mt-1.5 px-1">Enter to send · Shift+Enter for new line</p>
        </div>
      )}
    </div>
  )
}

function MessageBubble({ msg, botName }: { msg: Message; botName: string }) {
  const isUser = msg.role === 'user'

  return (
    <div className={`flex flex-col gap-1.5 ${isUser ? 'items-end' : 'items-start'}`}>
      <p className="text-[11px] font-semibold text-gray-400 px-1">
        {isUser ? 'You' : botName}
      </p>
      <div
        className={`max-w-[85%] sm:max-w-[75%] px-4 py-3 rounded-2xl text-sm whitespace-pre-wrap leading-relaxed ${
          isUser
            ? 'bg-amber-500 text-white rounded-br-sm shadow-sm shadow-amber-200'
            : 'bg-gray-50 border border-gray-100 text-gray-700 rounded-bl-sm shadow-sm'
        }`}
      >
        {msg.content}
      </div>
      {!isUser && (msg.latencyMs !== undefined || msg.costUsd !== undefined) && (
        <div className="flex items-center gap-3 px-1">
          {msg.latencyMs !== undefined && (
            <span className="flex items-center gap-1 text-[10px] text-gray-400">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {(msg.latencyMs / 1000).toFixed(1)}s
            </span>
          )}
          {msg.costUsd !== undefined && (
            <span className="flex items-center gap-1 text-[10px] text-gray-400">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              ${msg.costUsd.toFixed(4)}
            </span>
          )}
        </div>
      )}
    </div>
  )
}
