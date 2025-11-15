import React, { useState, useEffect } from 'react'

export default function FieldEditor({ field, onChange }) {
  if (!field) return <aside className="field-editor glass">Select a field to edit</aside>

  // local copy so editing options is easier
  const [local, setLocal] = useState(field)

  useEffect(() => setLocal(field), [field])

  function applyUpdate(next) {
    setLocal(next)
    onChange(next)
  }

  function update(key, val) {
    applyUpdate({ ...local, [key]: val })
  }

  function setOptionsFromText(text) {
    const opts = text.split(',').map(s => s.trim()).filter(Boolean)
    applyUpdate({ ...local, options: opts })
  }

  function onAddOption() {
    const next = { ...local, options: [...(local.options || []), 'New option'] }
    applyUpdate(next)
  }

  function onUpdateOption(idx, value) {
    const opts = [...(local.options || [])]
    opts[idx] = value
    applyUpdate({ ...local, options: opts })
  }

  function onRemoveOption(idx) {
    const opts = [...(local.options || [])]
    opts.splice(idx, 1)
    applyUpdate({ ...local, options: opts })
  }

  return (
    <aside className="field-editor glass">
      <h4 className="section-title">Form Details</h4>

      <div className="editor-body">
        {/* Field Name */}
        <label className="label">Field Name</label>
        <input className="input" value={local.fieldName || ''} onChange={e => update('fieldName', e.target.value)} placeholder="Name" />

        {/* Placeholder (kept for display) */}
        <label className="label">Placeholder (optional)</label>
        <input className="input" value={local.placeholder || ''} onChange={e => update('placeholder', e.target.value)} placeholder="text shown in input" />

        {/* Required */}
        <label className="row-label" style={{ marginTop: 8 }}>
          <input type="checkbox" checked={local.required || false} onChange={e => update('required', e.target.checked)} />
          <span className="label-inline"> Required</span>
        </label>

        {/* Options editor for select/radio/checkbox */}
        {(local.type === 'select' || local.type === 'radio' || local.type === 'checkbox') && (
          <>
            <label className="label" style={{ marginTop: 8 }}>Options</label>

            {/* inline option list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {(local.options || []).map((opt, i) => (
                <div key={i} style={{ display: 'flex', gap: 8 }}>
                  <input className="input" value={opt} onChange={e => onUpdateOption(i, e.target.value)} />
                  <button type="button" className="btn" onClick={() => onRemoveOption(i)} style={{ padding: '6px 8px' }}>Remove</button>
                </div>
              ))}
              <div style={{ display: 'flex', gap: 8 }}>
                <button type="button" className="btn btn-primary" onClick={onAddOption}>Add option</button>
                <input className="input" placeholder=" use , to set options quickly" onBlur={e => setOptionsFromText(e.target.value)} />
              </div>
            </div>
          </>
        )}

        {/* File specific settings */}
        {local.type === 'file' && (
          <>
            <label className="label" style={{ marginTop: 8 }}>File settings</label>
            <label className="row-label">
              <input type="checkbox" checked={local.multiple || false} onChange={e => update('multiple', e.target.checked)} />
              <span className="label-inline"> Allow multiple files</span>
            </label>
          </>
        )}

        {/* Validation / extra */}
        {/* <label className="label" style={{ marginTop: 8 }}>Validation (optional JSON)</label>
        <input className="input" value={JSON.stringify(local.validation || {})} onChange={e => {
          try {
            const v = JSON.parse(e.target.value || '{}')
            update('validation', v)
          } catch (err) {
            // ignore parse errors while typing
            update('validation', local.validation)
          }
        }} /> */}
      </div>
    </aside>
  )
}
