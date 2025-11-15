// backend/src/middleware/auth.js
const jwt = require('jsonwebtoken')
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret'
const COOKIE_NAME = process.env.AUTH_COOKIE_NAME || 'nf_token'

function requireAuth(req, res, next) {
  try {
    // 1) check Authorization header first
    const auth = req.headers.authorization
    let token = null
    if (auth && auth.startsWith('Bearer ')) token = auth.split(' ')[1]

    // 2) fallback to cookie
    if (!token && req.cookies && req.cookies[COOKIE_NAME]) {
      token = req.cookies[COOKIE_NAME]
    }

    if (!token) return res.status(401).json({ error: 'unauthorized' })

    const payload = jwt.verify(token, JWT_SECRET)
    req.user = payload
    next()
  } catch (err) {
    return res.status(401).json({ error: 'invalid token' })
  }
}

module.exports = { requireAuth }
