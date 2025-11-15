import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import Navbar from '../components/ui/Navbar'
import FormRenderer from '../components/form/FormRenderer'
import { sampleForm } from '../lib/sampleData'

/**
 * FormRendererPage
 *
 * - Fetches form JSON by slug from backend: GET /api/forms/slug/:slug
 * - Passes `form` to FormRenderer component
 * - Provides an onSubmit handler that posts to /api/responses/:formId
 *
 * Environment:
 * - By default uses http://localhost:4000 as API base.
 * - To change, set Vite env var VITE_API_BASE (e.g. VITE_API_BASE=https://api.example.com)
 */

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000'

export default function FormRendererPage() {
  const { slug } = useParams() // route: /forms/:slug
  const [form, setForm] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [successMsg, setSuccessMsg] = useState(null)

  useEffect(() => {
    let ignore = false
    async function fetchForm() {
      setLoading(true)
      setError(null)
      setSuccessMsg(null)
      try {
        if (!slug) {
          // no slug provided — fallback to sample form
          setForm(sampleForm)
          setLoading(false)
          return
        }
        const res = await fetch(`${API_BASE}/api/forms/slug/${encodeURIComponent(slug)}`)
        if (!res.ok) {
          const body = await res.json().catch(() => ({}))
          throw new Error(body?.error || `Failed to fetch form (status ${res.status})`)
        }
        const json = await res.json()
        if (!ignore) setForm(json.form)
      } catch (err) {
        console.error('Fetch form error', err)
        if (!ignore) setError(err.message || 'Failed to load form')
      } finally {
        if (!ignore) setLoading(false)
      }
    }

    fetchForm()
    return () => { ignore = true }
  }, [slug])

  // onSubmit handler to send responses to backend
  async function handleSubmit(values) {
    // values: { fieldId: value, ... } as produced by react-hook-form
    if (!form || !form._id) {
      setError('Form not ready or missing id.')
      return { ok: false, error: 'Form not ready' }
    }
    setSubmitting(true)
    setError(null)
    setSuccessMsg(null)
    try {
      const res = await fetch(`${API_BASE}/api/responses/${form._id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ values })
      })
      const j = await res.json()
      if (!res.ok) {
        throw new Error(j?.error || `Submission failed (status ${res.status})`)
      }
      setSuccessMsg('Thank you — your response has been submitted.')
      // optional: you can redirect or clear form depending on UX
      return { ok: true, data: j }
    } catch (err) {
      console.error('Submit error', err)
      setError(err.message || 'Submission failed')
      return { ok: false, error: err.message || 'Submission failed' }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="page">
      <Navbar />
      <main className="container">
        <section className="panel glass" style={{ padding: 18 }}>
          {loading && <div className="small">Loading form…</div>}

          {error && (
            <div style={{ marginBottom: 12 }}>
              <strong style={{ color: '#ff9aa2' }}>Error:</strong> <span>{error}</span>
            </div>
          )}

          {!loading && !form && (
            <div>
              <p>No form found.</p>
            </div>
          )}

          {!loading && form && (
            <>
              {/* Optional meta area */}
              <div style={{ marginBottom: 14 }}>
                <h2 style={{ margin: 0 }}>{form.title}</h2>
                {form.description && <p style={{ marginTop: 6, color: 'rgba(255,255,255,0.75)' }}>{form.description}</p>}
              </div>

              {/* Pass onSubmit to FormRenderer. If your FormRenderer currently ignores onSubmit,
                  you'll need to update it to accept a prop `onSubmit` and call it instead of its
                  own console.log. I can provide that updated FormRenderer if you want. */}
              <FormRenderer
                form={form}
                onSubmit={handleSubmit}   // if FormRenderer supports it, it will use this
                submitting={submitting}   // optional prop; you can use it in FormRenderer to disable submit button
              />

              {submitting && <div className="small" style={{ marginTop: 8 }}>Submitting…</div>}
              {successMsg && <div className="small" style={{ marginTop: 8, color: '#9fe599' }}>{successMsg}</div>}
            </>
          )}
        </section>
      </main>
    </div>
  )
}
