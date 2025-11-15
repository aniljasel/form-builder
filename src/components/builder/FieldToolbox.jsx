import React from 'react'

const TOOL_ITEMS = [
  { type: 'text', label: 'Single line text' },
  { type: 'textarea', label: 'Paragraph' },
  { type: 'select', label: 'Dropdown' },
  { type: 'radio', label: 'Radio' },
  { type: 'checkbox', label: 'Checkbox' },
  { type: 'email', label: 'Email' },
  { type: 'date', label: 'Date' },
  { type: 'file', label: 'File upload' },
]

export default function FieldToolbox({ onAdd }) {
  return (
    <aside className="toolbox glass">
      <h4 className="toolbox-title">Add fields</h4>
      <div className="tool-items">
        {TOOL_ITEMS.map(t => (
          <button
            key={t.type}
            onClick={() => onAdd(t.type)}
            className="tool-item"
            type="button"
          >
            {t.label}
          </button>
        ))}
      </div>
    </aside>
  )
}
