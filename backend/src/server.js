require('dotenv').config()
const fs = require('fs')
const path = require('path')
const express = require('express')
const helmet = require('helmet')
const cors = require('cors')
const morgan = require('morgan')
const rateLimit = require('express-rate-limit')
const mongoose = require('mongoose')
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
app.use(express.json({ limit: '8mb' }))
app.use(express.urlencoded({ extended: true, limit: '8mb' }))
app.use(morgan('dev'))

// CORS: support comma-separated list in env or '*' fallback
const rawOrigins = (process.env.CORS_ORIGIN || '*').split(',').map(s => s.trim()).filter(Boolean)
if (rawOrigins.length === 1 && rawOrigins[0] === '*') {
  app.use(cors())
  console.log('CORS: allowing all origins (*)')
} else {
  app.use(cors({
    origin: function(origin, callback){
      // allow non-browser (postman / server) requests with no origin
      if (!origin) return callback(null, true)
      if (rawOrigins.includes(origin)) return callback(null, true)
      return callback(new Error('CORS not allowed'), false)
    }
  }))
  console.log('CORS origins:', rawOrigins)
}

// Rate limiter (basic)
const limiter = rateLimit({ windowMs: 60 * 1000, max: 120 }) // 120 requests per minute
app.use(limiter)

// Serve uploaded files
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
