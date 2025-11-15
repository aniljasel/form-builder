const express = require('express')
const router = express.Router()
const Response = require('../models/Response')
const Form = require('../models/Form')
const { requireAuth } = require('../middleware/auth')
const { stringify } = require('csv-stringify')

// Submit a response (public)
router.post('/:formId', async (req, res) => {
  try {
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
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: err.message })
  }
})

// Get responses for a form (admin)
router.get('/form/:formId', requireAuth, async (req, res) => {
  try {
    const { formId } = req.params
    const list = await Response.find({ formId }).sort({ submittedAt: -1 }).limit(5000)
    res.json({ ok: true, responses: list })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: err.message })
  }
})

// Export responses CSV (admin)
router.get('/export/:formId', requireAuth, async (req, res) => {
  try {
    const { formId } = req.params
    const form = await Form.findById(formId)
    if (!form) return res.status(404).json({ error: 'form not found' })
    const rows = await Response.find({ formId }).lean().limit(10000)

    // Build header: submittedAt + each field id
    const header = ['submittedAt', ...form.fields.map(f => f.id)]
    res.setHeader('Content-Type', 'text/csv')
    res.setHeader('Content-Disposition', `attachment; filename="responses_${form.slug || form._id}.csv"`)

    // stream CSV
    const stringifier = stringify({ header: false })
    stringifier.pipe(res)

    // write header row
    stringifier.write(header)

    for (const r of rows) {
      const row = [r.submittedAt ? r.submittedAt.toISOString() : '']
      for (const f of form.fields) {
        let v = r.values ? r.values[f.id] : ''
        if (Array.isArray(v)) v = v.join('|')
        if (typeof v === 'object') v = JSON.stringify(v)
        row.push(v ?? '')
      }
      stringifier.write(row)
    }
    stringifier.end()
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
