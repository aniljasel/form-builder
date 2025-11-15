// backend/src/server.js
require('dotenv').config()
const fs = require('fs')
const path = require('path')
const express = require('express')
const helmet = require('helmet')
const cors = require('cors')
const morgan = require('morgan')
const rateLimit = require('express-rate-limit')
const mongoose = require('mongoose')
const cookieParser = require('cookie-parser')
const routes = require('./routes')

const app = express()

// Ensure uploads folder exists (so multer can write into it)
const uploadsDir = path.join(__dirname, '../uploads')
try {
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true })
    console.log('Created uploads directory:', uploadsDir)
  }
} catch (err) {
  console.error('Failed to create uploads directory', err)
}

// Middlewares
app.use(helmet())
app.use(express.json({ limit: '5mb' }))
app.use(express.urlencoded({ extended: true, limit: '5mb' }))
app.use(morgan('dev'))
app.use(cookieParser())

// CORS — IMPORTANT: allow credentials and exact origin
const FRONTEND_ORIGIN = process.env.CORS_ORIGIN || 'https://form-builder-nine-tau.vercel.app'
app.use(cors({
  origin: FRONTEND_ORIGIN,
  credentials: true,
}))

// Rate limiter (basic)
const limiter = rateLimit({ windowMs: 60 * 1000, max: 120 }) // 120 requests per minute
app.use(limiter)

app.use('/uploads', express.static(uploadsDir))

// Connect MongoDB
const MONGODB_URI = process.env.MONGODB_URI
if (!MONGODB_URI) {
  console.error('MONGODB_URI not set in env')
  process.exit(1)
}
mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => { console.error('MongoDB connection error', err); process.exit(1) })

// API Routes (index.js should also mount uploads route at /api/uploads)
app.use('/api', routes)

// Simple health check
app.get('/health', (req, res) => res.json({ ok: true, time: Date.now() }))

const PORT = process.env.PORT || 4000
app.listen(PORT, () => console.log(`Server listening on ${PORT}`))
