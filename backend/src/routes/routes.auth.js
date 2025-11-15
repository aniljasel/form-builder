const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const User = require('../models/User')

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret'

// bootstrap admin (only if no users exist) - simple
router.post('/bootstrap', async (req, res) => {
  const { email, password } = req.body
  if (!email || !password) return res.status(400).json({ error: 'email & password required' })
  const count = await User.countDocuments()
  if (count > 0) return res.status(403).json({ error: 'already bootstrapped' })
  const hash = await bcrypt.hash(password, 10)
  const u = await User.create({ email, passwordHash: hash })
  res.json({ ok: true, userId: u._id })
})

// login
router.post('/login', async (req, res) => {
  const { email, password } = req.body
  if (!email || !password) return res.status(400).json({ error: 'email & password required' })
  const user = await User.findOne({ email })
  if (!user) return res.status(401).json({ error: 'invalid credentials' })
  const ok = await bcrypt.compare(password, user.passwordHash)
  if (!ok) return res.status(401).json({ error: 'invalid credentials' })
  const token = jwt.sign({ sub: user._id, role: user.role, email: user.email }, JWT_SECRET, { expiresIn: '12h' })
  res.json({ token })
})

module.exports = router
