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

  return (
    <div className="flex items-center border-b border-amber-100 bg-white/60 overflow-x-auto flex-shrink-0">
      {tabs.map((tab) => (
        <div
          key={tab.id}
          className={`flex items-center gap-1 px-3 py-2 cursor-pointer text-sm whitespace-nowrap border-b-2 transition-colors ${
            tab.id === activeTabId
              ? 'border-amber-500 text-amber-700 bg-amber-50'
              : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
          }`}
          onClick={() => onTabChange(tab.id)}
          onDoubleClick={() => startEditing(tab)}
        >
          {tab.isBaseCase && <span className="text-xs">🔒</span>}
          {editingTabId === tab.id ? (
            <input
              className="border border-amber-300 rounded px-1 text-sm w-24 focus:outline-none"
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
              className="ml-1 text-gray-400 hover:text-red-500 transition-colors text-xs leading-none"
              onClick={(e) => {
                e.stopPropagation()
                onDeleteTab(tab.id)
              }}
              title="Delete tab"
            >
              ×
            </button>
          )}
        </div>
      ))}
      <button
        className="px-3 py-2 text-gray-500 hover:text-amber-600 hover:bg-amber-50 transition-colors text-lg leading-none font-light border-b-2 border-transparent"
        onClick={onAddTab}
        title="Add new tab"
      >
        +
      </button>
    </div>
  )
}
