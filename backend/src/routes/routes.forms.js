const express = require('express')
const router = express.Router()
const Form = require('../models/Form')
const { requireAuth } = require('../middleware/auth')
const validator = require('validator')

// Public: get form by slug (public) -> used by form renderer
// NOTE: placed before '/:id' so it doesn't get shadowed
router.get('/slug/:slug', async (req, res) => {
  try {
    const slug = req.params.slug
    const f = await Form.findOne({ slug })
    if (!f) return res.status(404).json({ error: 'not found' })
    res.json({ ok: true, form: f })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: err.message })
  }
})

// Create Form (admin)
router.post('/', requireAuth, async (req, res) => {
  const body = req.body
  if (!body.title || !body.slug) return res.status(400).json({ error: 'title & slug required' })
  // basic sanitization
  body.title = validator.escape(body.title)
  body.description = body.description ? validator.escape(body.description) : ''
  // sanitize slug (lowercase, alphanumeric, hyphens)
  body.slug = String(body.slug).toLowerCase().trim().replace(/[^a-z0-9\-]+/g, '-').replace(/^\-+|\-+$/g, '')
  body.createdBy = req.user.sub

  try {
    // check duplicate slug
    const exists = await Form.findOne({ slug: body.slug })
    if (exists) return res.status(409).json({ error: 'slug already used' })

    const form = await Form.create(body)
    res.json({ ok: true, form })
  } catch (err) {
    console.error(err)
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
  try {
    const list = await Form.find().sort({ createdAt: -1 })
    res.json({ ok: true, forms: list })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Get form by id (admin)
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const f = await Form.findById(req.params.id)
    if (!f) return res.status(404).json({ error: 'not found' })
    res.json({ ok: true, form: f })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Delete form (admin)
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    await Form.findByIdAndDelete(req.params.id)
    res.json({ ok: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
