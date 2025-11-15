import React, { useState } from 'react'
import Navbar from '../components/ui/Navbar'
import FieldToolbox from '../components/builder/FieldToolbox'
import FormCanvas from '../components/builder/FormCanvas'
import FieldEditor from '../components/builder/FieldEditor'
import { v4 as uuid } from 'uuid'
import { sampleForm } from '../lib/sampleData'

export default function FormBuilderPage() {
  const [fields, setFields] = useState(sampleForm?.fields || [])
  const [selected, setSelected] = useState(null)
  const [title, setTitle] = useState(sampleForm?.title || 'Untitled Form')
  const [slug, setSlug] = useState(sampleForm?.slug || '')
  const [saving, setSaving] = useState(false)

  function handleAdd(type) {
    const id = 'f_' + uuid()
    const base = { id, type, label: `${type} label`, placeholder: '', required: false, options: [] }
    // if file type add multiple default false
    if (type === 'file') base.multiple = false
    const next = [...fields, base]
    setFields(next)
    setSelected(base)
  }

  function handleUpdateField(updated) {
    setFields(fields.map(f => f.id === updated.id ? updated : f))
    setSelected(updated)
  }

  function handleRemoveField(id) {
    const next = fields.filter(f => f.id !== id)
    setFields(next)
    if (selected && selected.id === id) setSelected(null)
  }

  // Save to backend or localStorage
  async function handleSaveForm(publish = false) {
    setSaving(true)
    const payload = {
      title,
      slug: slug || title.toLowerCase().replace(/\s+/g, '-'),
      description: '',
      settings: { submitText: 'Submit' },
      fields: fields.map(f => {
        // ensure fieldName exists
        return { ...f, fieldName: f.fieldName || f.id, label: f.label || f.fieldName || f.id }
      })
    }

    const token = localStorage.getItem('token')
    try {
      if (token) {
        const res = await fetch((import.meta.env.VITE_API_BASE || 'http://localhost:4000') + '/api/forms', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify(payload)
        })
        const j = await res.json()
        if (!res.ok) throw new Error(j?.error || `Save failed ${res.status}`)
        alert('Form saved to server ✔️')
      } else {
        // fallback to local storage draft
        const key = 'draft_form_' + Date.now()
        localStorage.setItem(key, JSON.stringify(payload))
        alert('No token found — saved draft locally as ' + key)
      }
    } catch (err) {
      console.error('Save error', err)
      alert('Save failed: ' + (err.message || err))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="page">
      <Navbar />
      <main className="container">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginBottom: 20 }}>
          {/* <div>
            <input className="input" value={title} onChange={e => setTitle(e.target.value)} style={{ fontSize: 18, padding: 10 }} />
            <div className="small">Slug: <input className="input" value={slug} onChange={e => setSlug(e.target.value)} style={{ display: 'inline-block', width: 220 }} /></div>
          </div> */}

          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn" onClick={() => handleSaveForm(false)} disabled={saving}>Save draft</button>
            <button className="btn btn-primary" onClick={() => handleSaveForm(true)} disabled={saving}>{saving ? 'Saving…' : 'Create / Publish'}</button>
          </div>
        </div>

        <div className="builder-grid">
          <div className="col col-toolbox">
            <FieldToolbox onAdd={handleAdd} />
          </div>

          <div className="col col-canvas">
            <FormCanvas fields={fields} setFields={setFields} onSelect={setSelected} onRemove={handleRemoveField} />
          </div>

          <div className="col col-editor">
            <FieldEditor field={selected} onChange={handleUpdateField} />
          </div>
        </div>
      </main>
    </div>
  )
}
