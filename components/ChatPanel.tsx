'use client'

import { useState, useRef, useEffect, useCallback, type RefObject } from 'react'
import { createPortal } from 'react-dom'
import { Tab, Message } from '@/lib/types'
import { MODELS } from '@/lib/models'
import { resolveContextForRequest } from '@/lib/company-context'

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
  const messagesScrollRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const selectedModel = MODELS.find(m => m.id === tab.modelId)
  const botName = selectedModel?.name ?? 'AI'

  useEffect(() => {
    if (tab.isBaseCase) {
      messagesScrollRef.current?.scrollTo({ top: 0, behavior: 'auto' })
      return
    }
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [tab.isBaseCase, tab.id, tab.messages, isLoading])

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
    ta.style.height = Math.min(ta.scrollHeight, 120) + 'px'
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
    ]
    if (!tab.isBaseCase) {
      lines.push('============================')
      lines.push('COMPANY CONTEXT (effective for API):')
      lines.push(resolveContextForRequest(tab.companyContext))
    }
    lines.push('============================', 'CONVERSATION:')
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
    <div className="flex flex-col h-full min-h-0 bg-white border-2 border-swiss-ink m-2 sm:m-3 shadow-[6px_6px_0_0_rgba(12,12,12,0.12)]">
      <div className="flex items-stretch border-b-2 border-swiss-ink shrink-0">
        <div className="w-2 bg-swiss-blue shrink-0" aria-hidden />
        {tab.isBaseCase ? (
          <div className="flex flex-1 items-start gap-4 px-4 sm:px-5 py-4 min-w-0">
            <div className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center border-2 border-swiss-ink bg-swiss-beige/50">
              <svg className="h-5 w-5 text-swiss-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-swiss-sage">Benchmark · read-only</p>
              <h2 className="mt-1 text-lg font-bold uppercase tracking-wide text-swiss-ink sm:text-xl">
                Launch-week support transcripts
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-neutral-700">
                Frozen thread from go-live week — the &ldquo;before&rdquo; picture. Use the dashed <span className="font-mono font-bold text-swiss-ink">?</span> beside bot lines
                for facilitator coach notes (not part of the chat transcript).
              </p>
            </div>
          </div>
        ) : (
        <div className="flex flex-1 items-center justify-between px-4 sm:px-5 py-4 min-w-0">
          <div className="flex items-center gap-4 min-w-0">
            <div className="w-11 h-11 border-2 border-swiss-ink bg-swiss-orange/15 flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 text-swiss-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-swiss-sage leading-none mb-1">
                Live chat
              </p>
              <p className="text-lg sm:text-xl font-bold text-swiss-ink uppercase tracking-wide truncate">
                Conversation
              </p>
              <p className="text-sm text-neutral-600 font-medium mt-0.5 truncate">
                {botName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleNewChat}
                className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-neutral-600 hover:text-swiss-ink border-2 border-transparent hover:border-swiss-ink px-3 py-2 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Clear
              </button>
              <button
                onClick={handleExport}
                className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-neutral-600 hover:text-swiss-ink border-2 border-transparent hover:border-swiss-ink px-3 py-2 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Export
              </button>
            </div>
          </div>
        )}
      </div>

      <div
        ref={messagesScrollRef}
        className="flex-1 overflow-y-auto px-5 py-6 flex flex-col gap-6 min-h-0 scrollbar-thin"
      >
        {tab.messages.length === 0 && !tab.isBaseCase && (
          <div className="flex flex-col items-center justify-center gap-5 text-center py-12 flex-1">
            <div className="w-16 h-16 border-2 border-swiss-ink bg-swiss-orange/10 flex items-center justify-center">
              <svg className="w-8 h-8 text-swiss-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <div>
              <p className="text-xl font-bold uppercase tracking-wide text-swiss-ink">Optimize support here</p>
              <p className="text-base text-neutral-600 mt-2 leading-relaxed max-w-md mx-auto">
                Use <strong className="text-swiss-ink">Configuration</strong> (sidebar, or Config on small screens) to change the system prompt,
                model, and company context—then send customer messages and compare results to the Base Case. Add more tabs from the tab bar when you want parallel variations.
              </p>
            </div>
            <div className="flex flex-col gap-3 w-full max-w-md">
              {SUGGESTED_MESSAGES.map((msg) => (
                <button
                  key={msg}
                  onClick={() => {
                    setInput(msg)
                    textareaRef.current?.focus()
                  }}
                  className="text-left text-base font-medium text-swiss-ink bg-white border-2 border-neutral-300 hover:border-swiss-blue hover:bg-sky-50 px-4 py-3 transition-colors"
                >
                  {msg}
                </button>
              ))}
            </div>
          </div>
        )}

        {tab.messages.map((msg: Message) => (
            <MessageBubble
              key={msg.id}
              msg={msg}
              botName={botName}
              showCoachHints={tab.isBaseCase}
            />
          ))}

        {isLoading && (
          <div className="flex flex-col items-start gap-2">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-neutral-500 px-1">{botName}</p>
            <div className="border-2 border-swiss-ink bg-swiss-beige/40 px-5 py-4 flex items-center gap-2">
              {[0, 150, 300].map((delay) => (
                <span
                  key={delay}
                  className="w-2 h-2 rounded-full bg-swiss-ink animate-bounce"
                  style={{ animationDelay: `${delay}ms`, animationDuration: '900ms' }}
                />
              ))}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {!tab.isBaseCase && (
        <div className="flex-shrink-0 border-t-2 border-swiss-ink bg-swiss-beige/30 px-4 py-4">
          <div className="flex items-end gap-3 border-2 border-swiss-ink bg-white px-4 py-3 focus-within:ring-2 focus-within:ring-swiss-blue/40 transition-all">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={handleTextareaChange}
              onKeyDown={handleKeyDown}
              placeholder="Type a customer message…"
              rows={1}
              disabled={isLoading}
              className="flex-1 bg-transparent text-base resize-none focus:outline-none disabled:opacity-50 overflow-hidden text-swiss-ink placeholder:text-neutral-400 leading-relaxed min-h-[28px] max-h-[120px]"
            />
            <button
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className="bg-swiss-orange hover:bg-[#cf5204] disabled:opacity-40 disabled:cursor-not-allowed text-white border-2 border-swiss-ink w-11 h-11 flex items-center justify-center flex-shrink-0 transition-colors shadow-[3px_3px_0_0_rgba(12,12,12,1)]"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
          <div className="mt-2 flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between px-1 min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500 m-0 min-w-0">
              Enter to send · Shift+Enter new line
            </p>
            <p className="text-[10px] text-neutral-400 m-0 sm:text-right sm:shrink-0 sm:self-end leading-tight">
              Copyright Overclock Accelerator {new Date().getFullYear()}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

const HINT_CLOSE_MS = 220

function computeCoachPopoverStyle(trigger: DOMRect): {
  top: number
  left: number
  width: number
  transform: string
} {
  const margin = 12
  const maxW = Math.min(400, window.innerWidth - margin * 2)
  let left = trigger.left
  if (left + maxW > window.innerWidth - margin) {
    left = window.innerWidth - margin - maxW
  }
  if (left < margin) left = margin

  const gap = 10
  const estH = 240
  let top = trigger.bottom + gap
  let transform = ''
  if (top + estH > window.innerHeight - margin && trigger.top > estH + margin) {
    top = trigger.top - gap
    transform = 'translateY(-100%)'
  }
  return { top, left, width: maxW, transform }
}

function HintPopout({
  open,
  hint,
  headline,
  variant,
  triggerRef,
  onPointerLeaveIntent,
  onPointerEnter,
}: {
  open: boolean
  hint: string
  headline?: string
  variant: 'content' | 'perf'
  triggerRef: RefObject<HTMLButtonElement | null>
  onPointerLeaveIntent: () => void
  onPointerEnter: () => void
}) {
  const [style, setStyle] = useState({
    top: 0,
    left: 0,
    width: 360,
    transform: '' as string,
  })

  const refreshPosition = useCallback(() => {
    const el = triggerRef.current
    if (!el) return
    setStyle(computeCoachPopoverStyle(el.getBoundingClientRect()))
  }, [triggerRef])

  useEffect(() => {
    if (!open) return
    refreshPosition()
    const onWin = () => refreshPosition()
    window.addEventListener('scroll', onWin, true)
    window.addEventListener('resize', onWin)
    return () => {
      window.removeEventListener('scroll', onWin, true)
      window.removeEventListener('resize', onWin)
    }
  }, [open, refreshPosition])

  if (!open || typeof document === 'undefined') return null

  const isPerf = variant === 'perf'

  return createPortal(
    <div
      data-coach-hint-panel
      className="fixed z-[9999] p-0 isolate"
      style={{ top: style.top, left: style.left, width: style.width, transform: style.transform }}
      role="tooltip"
      onMouseEnter={onPointerEnter}
      onMouseLeave={onPointerLeaveIntent}
    >
      <div
        className={`rounded-sm border-2 border-swiss-ink overflow-hidden
          shadow-[inset_0_1px_0_rgba(255,255,255,0.65),inset_0_-2px_0_rgba(12,12,12,0.06),4px_4px_0_0_#0c0c0c,12px_14px_28px_rgba(12,12,12,0.28)]
          [transform:rotate(-0.35deg)]
          ${isPerf
            ? 'bg-gradient-to-b from-orange-50 via-amber-50 to-orange-50'
            : 'bg-gradient-to-b from-amber-100 via-amber-50 to-amber-100'
          }`}
      >
        <div className={`flex flex-wrap items-center gap-x-2 gap-y-1 border-b-2 border-swiss-ink/20 px-3 py-2
          ${isPerf ? 'bg-orange-200/50' : 'bg-swiss-blue/15'}`}>
          <span className={`text-[10px] font-black uppercase tracking-[0.2em]
            ${isPerf ? 'text-orange-700' : 'text-swiss-blue'}`}>
            {isPerf ? 'Cost & speed' : 'Facilitator note'}
          </span>
          {headline && (
            <span className="text-[10px] font-bold uppercase tracking-wider text-swiss-ink/80">
              · {headline}
            </span>
          )}
        </div>
        <p className="px-3.5 py-3.5 text-sm font-medium leading-relaxed text-swiss-ink/95">
          {hint}
        </p>
      </div>
    </div>,
    document.body
  )
}

function HintButton({
  hint,
  headline,
  variant,
  ariaLabel,
}: {
  hint: string
  headline?: string
  variant: 'content' | 'perf'
  ariaLabel: string
}) {
  const btnRef = useRef<HTMLButtonElement>(null)
  const [open, setOpen] = useState(false)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const cancelClose = useCallback(() => {
    if (closeTimer.current) { clearTimeout(closeTimer.current); closeTimer.current = null }
  }, [])

  const scheduleClose = useCallback(() => {
    cancelClose()
    closeTimer.current = setTimeout(() => setOpen(false), HINT_CLOSE_MS)
  }, [cancelClose])

  const openHint = useCallback(() => { cancelClose(); setOpen(true) }, [cancelClose])

  useEffect(() => () => cancelClose(), [cancelClose])

  useEffect(() => {
    if (!open) return
    function onDocPointerDown(e: PointerEvent) {
      const t = e.target as HTMLElement
      if (btnRef.current?.contains(t)) return
      if (t.closest('[data-coach-hint-panel]')) return
      setOpen(false)
    }
    document.addEventListener('pointerdown', onDocPointerDown, true)
    return () => document.removeEventListener('pointerdown', onDocPointerDown, true)
  }, [open])

  const isPerf = variant === 'perf'

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        aria-label={ariaLabel}
        aria-expanded={open}
        aria-haspopup="dialog"
        onMouseEnter={openHint}
        onMouseLeave={scheduleClose}
        onFocus={openHint}
        onBlur={scheduleClose}
        onPointerDown={(e) => { if (e.pointerType === 'touch') { cancelClose(); setOpen(true) } }}
        className={`shrink-0 flex flex-col items-center justify-center gap-0.5 border-2 border-dashed
          focus:outline-none focus-visible:ring-2 cursor-help self-stretch
          shadow-[2px_2px_0_0_rgba(12,12,12,0.12)]
          ${isPerf
            ? 'border-orange-400/70 bg-gradient-to-b from-orange-50 to-amber-100/60 px-1.5 py-1.5 min-w-[2.25rem] hover:from-orange-100 hover:to-amber-200/60 focus-visible:ring-orange-400'
            : 'border-swiss-blue bg-gradient-to-b from-white to-swiss-beige/40 px-2 py-2 min-w-[2.75rem] min-h-[3rem] hover:from-amber-50 hover:to-amber-100/50 focus-visible:ring-swiss-blue'
          }`}
      >
        {isPerf ? (
          <>
            <svg className="w-3.5 h-3.5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-[8px] font-black uppercase tracking-wider text-orange-700/80">cost</span>
          </>
        ) : (
          <>
            <span className="text-lg font-black leading-none text-swiss-blue">?</span>
            <span className="text-[9px] font-black uppercase tracking-wider text-swiss-ink/70">note</span>
          </>
        )}
      </button>
      <HintPopout
        open={open}
        hint={hint}
        headline={headline}
        variant={variant}
        triggerRef={btnRef}
        onPointerEnter={cancelClose}
        onPointerLeaveIntent={scheduleClose}
      />
    </>
  )
}

function MessageBubble({
  msg,
  botName,
  showCoachHints,
}: {
  msg: Message
  botName: string
  showCoachHints?: boolean
}) {
  const isUser = msg.role === 'user'
  const hasContentHint = showCoachHints && !!msg.coachHint
  const hasPerfHint = showCoachHints && !!msg.perfHint

  return (
    <div className={`flex flex-col gap-2 ${isUser ? 'items-end' : 'items-start'}`}>
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-neutral-500 px-1">
        {isUser ? 'You' : botName}
      </p>
      {hasContentHint || hasPerfHint ? (
        <div className="flex max-w-[90%] sm:max-w-[80%] items-stretch gap-1.5">
          <div className="min-w-0 flex-1 px-5 py-4 text-base whitespace-pre-wrap leading-relaxed border-2 bg-white text-swiss-ink border-neutral-300">
            {msg.content}
          </div>
          <div className="flex flex-row gap-1.5 shrink-0 self-stretch">
            {hasContentHint && (
              <HintButton
                hint={msg.coachHint ?? ''}
                headline={msg.coachHeadline}
                variant="content"
                ariaLabel="Show facilitator note: what went wrong with this bot reply"
              />
            )}
            {hasPerfHint && (
              <HintButton
                hint={msg.perfHint ?? ''}
                headline={msg.perfHeadline}
                variant="perf"
                ariaLabel="Show cost and speed note for this reply"
              />
            )}
          </div>
        </div>
      ) : (
        <div
          className={`max-w-[90%] sm:max-w-[80%] px-5 py-4 text-base whitespace-pre-wrap leading-relaxed border-2 ${
            isUser
              ? 'bg-swiss-orange text-white border-swiss-ink shadow-[4px_4px_0_0_rgba(12,12,12,0.2)]'
              : 'bg-white text-swiss-ink border-neutral-300'
          }`}
        >
          {msg.content}
        </div>
      )}
      {!isUser && (msg.latencyMs !== undefined || msg.costUsd !== undefined) && (
        <div className="flex items-center gap-4 px-1">
          {msg.latencyMs !== undefined && (
            <span className="flex items-center gap-1.5 text-sm text-neutral-600 font-mono">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {(msg.latencyMs / 1000).toFixed(1)}s
            </span>
          )}
          {msg.costUsd !== undefined && (
            <span className="flex items-center gap-1.5 text-sm text-neutral-600 font-mono">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
