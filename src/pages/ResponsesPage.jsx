import React, { useEffect, useState } from 'react'
const API = import.meta.env.VITE_API_BASE || 'https://form-builder-vb1y.onrender.com'

export default function ResponsesPage({ formId }) {
  const [responses, setResponses] = useState([])
  const [loading, setLoading] = useState(true)
  const token = localStorage.getItem('token')

  useEffect(() => {
    if (!formId) return
    setLoading(true)
    fetch(`${API}/api/responses/form/${formId}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(j => { setResponses(j.responses || j); setLoading(false) })
      .catch(e => { console.error(e); setLoading(false) })
  }, [formId])

  if (loading) return <div>Loading responses…</div>

  // flatten all response keys for table header
  const columns = Array.from(new Set(responses.flatMap(r => Object.keys(r.values || {}))))

  function downloadCSV() {
    // you can also call backend export endpoint; here we build CSV client-side
    const rows = [ ['submittedAt', ...columns] ]
    for (const r of responses) {
      const row = [r.submittedAt || '', ...columns.map(c => JSON.stringify((r.values||{})[c] || ''))]
      rows.push(row)
    }
    const csv = rows.map(r => r.join(',')).join('\n')
    const a = document.createElement('a')
    a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv)
    a.download = `responses_${formId}.csv`
    document.body.appendChild(a); a.click(); a.remove()
  }

  function downloadSVGChart() {
    // simple bar chart: count responses per day
    const counts = {}
    for (const r of responses) {
      const d = (new Date(r.submittedAt)).toISOString().slice(0,10)
      counts[d] = (counts[d]||0) + 1
    }
    const days = Object.keys(counts).sort()
    const max = Math.max(...Object.values(counts), 1)
    // build SVG
    const width = 600, height = 200, pad = 40
    const barW = (width - pad*2) / days.length
    let bars = ''
    days.forEach((day,i) => {
      const h = (counts[day]/max) * (height - pad*2)
      const x = pad + i*barW
      const y = height - pad - h
      bars += `<rect x="${x}" y="${y}" width="${barW*0.7}" height="${h}" fill="#6c5ce7"/>`
      bars += `<text x="${x + barW*0.35}" y="${height - pad + 14}" font-size="10" text-anchor="middle">${day}</text>`
    })
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><rect width="100%" height="100%" fill="#0b1220"/><g fill="#fff">${bars}</g></svg>`
    const blob = new Blob([svg], {type:'image/svg+xml'})
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = `responses_chart_${formId}.svg`; a.click(); URL.revokeObjectURL(url)
  }

  return (
    <div>
      <h3>Responses ({responses.length})</h3>
      <div style={{ marginBottom: 10 }}>
        <button onClick={downloadCSV} className="btn">Download CSV</button>
        <button onClick={downloadSVGChart} className="btn">Download SVG chart</button>
      </div>

      <table className="table">
        <thead>
          <tr><th>Submitted At</th>{columns.map(c=> <th key={c}>{c}</th>)}</tr>
        </thead>
        <tbody>
          {responses.map(r => (
            <tr key={r._id}>
              <td>{new Date(r.submittedAt).toLocaleString()}</td>
              {columns.map(c => <td key={c}>{(r.values||{})[c] ? JSON.stringify((r.values||{})[c]) : ''}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
