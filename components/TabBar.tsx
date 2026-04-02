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
}

export default function TabBar({
  tabs,
  activeTabId,
  onTabChange,
  onAddTab,
  onDeleteTab,
  onRenameTab,
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

  const experimentCount = tabs.filter(t => !t.isBaseCase).length

  return (
    <div className="flex items-end border-b border-zinc-800 bg-zinc-950 px-3 overflow-x-auto flex-shrink-0 gap-0.5 pt-2">
      {tabs.map((tab) => {
        const isActive = tab.id === activeTabId
        return (
          <div
            key={tab.id}
            className={`
              group relative flex items-center gap-1.5 px-3.5 py-2.5 cursor-pointer
              text-xs font-medium whitespace-nowrap rounded-t-lg
              transition-all duration-150 select-none
              ${isActive
                ? 'bg-white text-gray-800 shadow-[0_-1px_4px_rgba(0,0,0,0.3)]'
                : 'bg-transparent text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/60'
              }
            `}
            onClick={() => onTabChange(tab.id)}
            onDoubleClick={() => startEditing(tab)}
          >
            {tab.isBaseCase ? (
              <svg className={`w-3 h-3 flex-shrink-0 ${isActive ? 'text-amber-500' : 'text-zinc-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            ) : (
              <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 transition-colors ${isActive ? 'bg-amber-500' : 'bg-gray-300'}`} />
            )}

            {editingTabId === tab.id ? (
              <input
                className="border border-amber-300 rounded px-1 text-xs w-24 focus:outline-none bg-white"
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
              <span>{tab.name}</span>
            )}

            {!tab.isBaseCase && (
              <button
                className="ml-0.5 w-4 h-4 flex items-center justify-center rounded text-gray-300 hover:text-red-400 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"
                onClick={(e) => {
                  e.stopPropagation()
                  onDeleteTab(tab.id)
                }}
                title="Close tab"
              >
                <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}

            {/* Bottom active indicator */}
            {isActive && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-500 rounded-t-sm" />
            )}
          </div>
        )
      })}

      {/* New tab button */}
      <button
        className="flex items-center gap-1.5 px-3 py-2.5 text-xs text-zinc-500 hover:text-amber-400 hover:bg-zinc-800/60 rounded-t-lg transition-all border-0"
        onClick={onAddTab}
        title={experimentCount === 0 ? 'Add your first experiment' : `Add experiment (${experimentCount} existing)`}
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        <span className="font-medium">New Experiment</span>
      </button>
    </div>
  )
}
