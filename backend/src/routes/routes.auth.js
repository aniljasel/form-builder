// backend/src/routes/routes.auth.js
const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const User = require('../models/User')

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret'
const COOKIE_NAME = process.env.AUTH_COOKIE_NAME || 'nf_token'
const COOKIE_MAX_MS = 7 * 24 * 60 * 60 * 1000 // 7 days

// Bootstrap: create first admin user ONLY if no users exist
router.post('/bootstrap', async (req, res) => {
  try {
    const count = await User.countDocuments()
    if (count > 0) return res.status(403).json({ error: 'bootstrap not allowed' })
    const { email, password, name } = req.body
    if (!email || !password) return res.status(400).json({ error: 'email and password required' })
    const hash = await bcrypt.hash(password, 10)
    const user = await User.create({ email: email.toLowerCase(), password: hash, name: name || 'Admin', role: 'admin', isAdmin: true })
    const token = jwt.sign({ sub: user._id.toString(), email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' })
    // set cookie
    res.cookie(COOKIE_NAME, token, {
      httpOnly: true,
      secure: true,               // must be true in production (https)
      sameSite: 'none',          // because frontend and backend are on different domains
      maxAge: COOKIE_MAX_MS,
    })
    res.json({ ok: true, user: { id: user._id, email: user.email } })
  } catch (err) {
    console.error('bootstrap error', err)
    res.status(500).json({ error: 'server error' })
  }
})

// Login — set cookie
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body || {}
    if (!email || !password) return res.status(400).json({ error: 'email and password required' })
    const user = await User.findOne({ email: String(email).toLowerCase().trim() }).lean()
    if (!user || !user.password) return res.status(401).json({ error: 'invalid credentials' })
    const match = await bcrypt.compare(password, user.password)
    if (!match) return res.status(401).json({ error: 'invalid credentials' })
    const token = jwt.sign({ sub: user._id.toString(), email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' })
    res.cookie(COOKIE_NAME, token, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: COOKIE_MAX_MS,
    })
    res.json({ ok: true, user: { id: user._id, email: user.email } })
  } catch (err) {
    console.error('login error', err)
    res.status(500).json({ error: 'server error' })
  }
})

// Logout — clear cookie
router.post('/logout', (req, res) => {
  res.clearCookie(COOKIE_NAME, { httpOnly: true, secure: true, sameSite: 'none' })
  res.json({ ok: true })
})

module.exports = router
