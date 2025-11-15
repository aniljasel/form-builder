const express = require('express')
const router = express.Router()
const Response = require('../models/Response')
const Form = require('../models/Form')
const { requireAuth } = require('../middleware/auth')
const stringify = require('csv-stringify').stringify

// Submit a response (public)
router.post('/:formId', async (req, res) => {
  const { formId } = req.params
  const form = await Form.findById(formId)
  if (!form) return res.status(404).json({ error: 'form not found' })

  const values = req.body.values || {}
  // basic server-side required-field validation
  for (const f of form.fields) {
    if (f.required && (values[f.id] === undefined || values[f.id] === '')) {
      return res.status(400).json({ error: `${f.label || f.id} is required` })
    }
  }

  const r = await Response.create({
    formId,
    values,
    ip: req.ip,
    userAgent: req.get('User-Agent') || '',
    meta: req.body.meta || {}
  })
  res.json({ ok: true, responseId: r._id })
})

// Get responses for a form (admin)
router.get('/form/:formId', requireAuth, async (req, res) => {
  const { formId } = req.params
  const list = await Response.find({ formId }).sort({ submittedAt: -1 }).limit(5000)
  res.json({ ok: true, responses: list })
})

// Export responses CSV (admin)
router.get('/export/:formId', requireAuth, async (req, res) => {
  const { formId } = req.params
  const form = await Form.findById(formId)
  if (!form) return res.status(404).json({ error: 'form not found' })
  const rows = await Response.find({ formId }).lean().limit(10000)

  // Build header: submittedAt + each field id
  const header = ['submittedAt', ...form.fields.map(f => f.id)]
  const data = rows.map(r => {
    const row = [r.submittedAt.toISOString()]
    for (const f of form.fields) {
      let v = r.values ? r.values[f.id] : ''
      if (Array.isArray(v)) v = v.join('|')
      if (typeof v === 'object') v = JSON.stringify(v)
      row.push(v ?? '')
    }
    return row
  })

  res.setHeader('Content-Type', 'text/csv')
  res.setHeader('Content-Disposition', `attachment; filename="responses_${form.slug || form._id}.csv"`)
  stringify([header, ...data], { delimiter: ',' }).pipe(res)
})

module.exports = router
