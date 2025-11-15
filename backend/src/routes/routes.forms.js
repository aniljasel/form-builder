const express = require('express')
const router = express.Router()
const Form = require('../models/Form')
const { requireAuth } = require('../middleware/auth')
const validator = require('validator')

// Create Form (admin)
router.post('/', requireAuth, async (req, res) => {
  const body = req.body
  if (!body.title || !body.slug) return res.status(400).json({ error: 'title & slug required' })
  // basic sanitization
  body.title = validator.escape(body.title)
  body.description = body.description ? validator.escape(body.description) : ''
  body.createdBy = req.user.sub
  try {
    const form = await Form.create(body)
    res.json({ ok: true, form })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Update form
router.put('/:id', requireAuth, async (req, res) => {
  const id = req.params.id
  try {
    const updated = await Form.findByIdAndUpdate(id, req.body, { new: true })
    res.json({ ok: true, form: updated })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// Get all forms (admin)
router.get('/', requireAuth, async (req, res) => {
  const list = await Form.find().sort({ createdAt: -1 })
  res.json({ ok: true, forms: list })
})

// Get form by id (admin)
router.get('/:id', requireAuth, async (req, res) => {
  const f = await Form.findById(req.params.id)
  if (!f) return res.status(404).json({ error: 'not found' })
  res.json({ ok: true, form: f })
})

// Get form by slug (public) -> used by form renderer
router.get('/slug/:slug', async (req, res) => {
  const f = await Form.findOne({ slug: req.params.slug })
  if (!f) return res.status(404).json({ error: 'not found' })
  res.json({ ok: true, form: f })
})

// Delete form (admin)
router.delete('/:id', requireAuth, async (req, res) => {
  await Form.findByIdAndDelete(req.params.id)
  res.json({ ok: true })
})

module.exports = router
