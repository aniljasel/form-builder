import React, { useEffect, useState } from 'react'
import Navbar from '../components/ui/Navbar'
import { sampleForm } from '../lib/sampleData'
import { Link, useNavigate } from 'react-router-dom'

export default function Dashboard() {
  const [drafts, setDrafts] = useState([]) // array of { key, title, createdAt }
  const [showDrafts, setShowDrafts] = useState(false)
  const [latestDraftKey, setLatestDraftKey] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    loadDraftsFromLocalStorage()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function loadDraftsFromLocalStorage() {
    try {
      const keys = Object.keys(localStorage)
        .filter(k => k.startsWith('draft_form_'))
        .sort() // older -> newer; we'll reverse below
        .reverse() // newest first

      const list = keys.map(k => {
        try {
          const raw = localStorage.getItem(k)
          const json = JSON.parse(raw)
          return {
            key: k,
            title: json?.title || 'Untitled draft',
            slug: json?.slug || '',
            createdAt: k.replace('draft_form_', '')
          }
        } catch {
          return { key: k, title: 'Draft (invalid json)', createdAt: k.replace('draft_form_', '') }
        }
      })

      setDrafts(list)
      if (list.length > 0) {
        setLatestDraftKey(list[0].key)
      } else {
        setLatestDraftKey(null)
      }
    } catch (err) {
      console.error('Failed to load drafts', err)
      setDrafts([])
      setLatestDraftKey(null)
    }
  }

  function handleEditDraft(key) {
    // mark which draft to edit and navigate to builder
    localStorage.setItem('editing_draft', key)
    navigate('/builder/new')
  }

  function handleDeleteDraft(key) {
    if (!window.confirm('Delete this draft?')) return
    localStorage.removeItem(key)
    loadDraftsFromLocalStorage()
  }

  function handleClearAllDrafts() {
    if (!window.confirm('Delete ALL local drafts?')) return
    Object.keys(localStorage).forEach(k => {
      if (k.startsWith('draft_form_')) localStorage.removeItem(k)
    })
    loadDraftsFromLocalStorage()
  }

  return (
    <div className="page">
      <Navbar />
      <main className="container">
        <div className="dashboard-grid">
          <section className="panel glass">
            <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3>Your Forms</h3>

              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <Link to="/builder/new" className="link-create">Create</Link>

                <button
                  className="link-create"
                  onClick={() => {
                    // toggle drafts panel and refresh list
                    loadDraftsFromLocalStorage()
                    setShowDrafts(s => !s)
                  }}
                  style={{background: 'transparent', border: 'none', fontSize: 16, cursor: 'pointer', marginBottom: 0}}
                >
                  Drafts
                </button>
              </div>
            </div>

            <div className="panel-body">
              {/* Latest draft banner */}
              {latestDraftKey && (
                <div style={{ marginBottom: 12, padding: 12, borderRadius: 8, background: 'linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01))' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <strong>Latest draft found:</strong>
                      <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.8)' }}>
                        {(() => {
                          try {
                            const j = JSON.parse(localStorage.getItem(latestDraftKey))
                            return j?.title || latestDraftKey
                          } catch { return latestDraftKey }
                        })()}
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="btn" onClick={() => handleEditDraft(latestDraftKey)}>Edit</button>
                      <button className="btn" onClick={() => { handleDeleteDraft(latestDraftKey); }}>Delete</button>
                    </div>
                  </div>
                </div>
              )}

              {/* Existing sample form card */}
              <article className="form-card">
                <div className="card-title">{sampleForm.title}</div>
                <div className="card-desc">{sampleForm.description}</div>
                <div className="card-actions">
                  <Link to={`/builder/${sampleForm._id}`} className="btn btn-ghost">Edit</Link>
                  <Link to={`/forms/${sampleForm.slug}`} className="btn btn-ghost">Open</Link>
                </div>
              </article>

              {/* Drafts list (toggle) */}
              {showDrafts && (
                <div style={{ marginTop: 18 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <h4 style={{ margin: 0 }}>Local drafts</h4>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="btn" onClick={() => { loadDraftsFromLocalStorage(); }}>Refresh</button>
                      <button className="btn" onClick={handleClearAllDrafts}>Clear all</button>
                    </div>
                  </div>

                  {drafts.length === 0 && <div className="text-sm text-white/70">No local drafts saved.</div>}

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
                    {drafts.map(d => (
                      <div key={d.key} className="bg-white/4 p-3 rounded-md" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontWeight: 600 }}>{d.title}</div>
                          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>Saved: {new Date(Number(d.createdAt) || Date.now()).toLocaleString()}</div>
                        </div>

                        <div style={{ display: 'flex', gap: 8 }}>
                          <button className="btn" onClick={() => handleEditDraft(d.key)}>Edit</button>
                          <button className="btn" onClick={() => handleDeleteDraft(d.key)}>Delete</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>

          <section className="panel glass">Coming soon</section>
          <section className="panel glass">Analytics</section>
        </div>
      </main>
    </div>
  )
}
