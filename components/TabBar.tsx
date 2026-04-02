'use client'

import { useState } from 'react'
import { Tab } from '@/lib/types'

interface TabBarProps {
  tabs: Tab[]
  activeTabId: string
  onTabChange: (id: string) => void
  onAddTab: () => void
  onDeleteTab: (id: string) => void
  onRenameTab: (id: string, name: string) => void
  onOpenInstructions?: () => void
}

export default function TabBar({
  tabs,
  activeTabId,
  onTabChange,
  onAddTab,
  onDeleteTab,
  onRenameTab,
  onOpenInstructions,
}: TabBarProps) {
  const [editingTabId, setEditingTabId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')

  function startEditing(tab: Tab) {
    if (tab.isBaseCase) return
    setEditingTabId(tab.id)
    setEditingName(tab.name)
  }

  function commitRename(id: string) {
    const trimmed = editingName.trim()
    if (trimmed) onRenameTab(id, trimmed)
    setEditingTabId(null)
  }

  const variationCount = tabs.filter((t) => !t.isBaseCase).length

  return (
    <div className="flex items-end border-b-2 border-swiss-ink bg-swiss-beige/40 flex-shrink-0 gap-1 pt-2 pr-2">
      <div className="flex min-w-0 flex-1 items-end gap-1 overflow-x-auto overflow-y-hidden px-2">
      {tabs.map((tab) => {
        const isActive = tab.id === activeTabId
        return (
          <div
            key={tab.id}
            className={`
              group relative flex items-center gap-2 px-4 py-3 cursor-pointer
              text-sm font-semibold whitespace-nowrap
              transition-colors duration-150 select-none border-2 border-b-0
              ${isActive
                ? 'bg-white text-swiss-ink border-swiss-ink border-b-white -mb-[2px] z-[1]'
                : 'bg-transparent text-neutral-600 border-transparent hover:text-swiss-ink hover:bg-white/70'
              }
            `}
            onClick={() => onTabChange(tab.id)}
            onDoubleClick={() => startEditing(tab)}
          >
            {tab.isBaseCase ? (
              <svg className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-swiss-orange' : 'text-neutral-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            ) : (
              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${isActive ? 'bg-swiss-blue' : 'bg-neutral-400'}`} />
            )}

            {editingTabId === tab.id ? (
              <input
                className="border-2 border-swiss-orange rounded-sm px-2 py-0.5 text-sm w-32 focus:outline-none bg-white"
                value={editingName}
                onChange={(e) => setEditingName(e.target.value)}
                onBlur={() => commitRename(tab.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') commitRename(tab.id)
                  if (e.key === 'Escape') setEditingTabId(null)
                }}
                onClick={(e) => e.stopPropagation()}
                autoFocus
              />
            ) : (
              <span className="uppercase tracking-wide text-xs sm:text-sm">{tab.name}</span>
            )}

            {!tab.isBaseCase && (
              <button
                className="ml-0.5 w-6 h-6 flex items-center justify-center text-neutral-400 hover:text-swiss-crimson hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all border border-transparent hover:border-swiss-crimson/30"
                onClick={(e) => {
                  e.stopPropagation()
                  onDeleteTab(tab.id)
                }}
                title="Close tab"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}

            {isActive && (
              <span className="absolute bottom-0 left-0 right-0 h-1 bg-swiss-orange" />
            )}
          </div>
        )
      })}

      <button
        type="button"
        onClick={onAddTab}
        title={variationCount === 0 ? 'New variation tab' : `New variation tab (${variationCount} open)`}
        aria-label="New variation tab"
        className="group ml-0.5 flex shrink-0 items-center justify-center border-2 border-b-0 border-transparent bg-transparent px-3 py-3 text-neutral-500 transition-colors duration-150 select-none hover:border-transparent hover:bg-white/70 hover:text-swiss-orange focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-swiss-blue focus-visible:ring-offset-2"
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-sm border border-neutral-300 bg-white/80 text-swiss-ink transition-colors group-hover:border-swiss-ink group-hover:bg-white group-hover:text-swiss-orange">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.25} viewBox="0 0 24 24" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
        </span>
      </button>
      </div>

      {onOpenInstructions && (
        <button
          type="button"
          onClick={onOpenInstructions}
          className="mb-0.5 flex shrink-0 items-center gap-2 border-2 border-swiss-ink bg-white px-3 py-2 text-sm font-bold uppercase tracking-wider text-swiss-ink transition-colors hover:border-swiss-blue hover:bg-swiss-blue/10"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
            />
          </svg>
          <span className="hidden sm:inline">Instructions</span>
        </button>
      )}
    </div>
  )
}
