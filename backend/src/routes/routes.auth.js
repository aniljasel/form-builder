const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const User = require('../models/User')

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret'
const BOOTSTRAP_ALLOWED = true // keep true for first-time bootstrap; remove/guard for prod

// Bootstrap: create first admin user ONLY if no users exist
router.post('/bootstrap', async (req, res) => {
  try {
    // only allow if no users exist
    const count = await User.countDocuments()
    if (count > 0) return res.status(403).json({ error: 'bootstrap not allowed' })

    const { email, password, name } = req.body
    if (!email || !password) return res.status(400).json({ error: 'email and password required' })

    const hash = await bcrypt.hash(password, 10)
    const user = await User.create({ email: email.toLowerCase(), password: hash, name: name || 'Admin', role: 'admin', isAdmin: true })
    const token = jwt.sign({ sub: user._id.toString(), email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' })
    res.json({ ok: true, user: { id: user._id, email: user.email }, token })
  } catch (err) {
    console.error('bootstrap error', err)
    res.status(500).json({ error: 'server error' })
  }
})

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body || {}
    if (!email || !password) return res.status(400).json({ error: 'email and password required' })

    const user = await User.findOne({ email: String(email).toLowerCase().trim() }).lean()
    if (!user || !user.password) {
      // do not reveal which one failed
      return res.status(401).json({ error: 'invalid credentials' })
    }

    const match = await bcrypt.compare(password, user.password)
    if (!match) return res.status(401).json({ error: 'invalid credentials' })

    const token = jwt.sign({ sub: user._id.toString(), email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' })
    res.json({ ok: true, token })
  } catch (err) {
    console.error('login error', err)
    res.status(500).json({ error: 'server error' })
  }
})

module.exports = router
