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
  // continue anyway; multer will error if cannot write
}

// Middlewares
app.use(helmet())
app.use(express.json({ limit: '5mb' }))
app.use(express.urlencoded({ extended: true, limit: '5mb' }))
app.use(morgan('dev'))

// CORS
const allowedOrigin = process.env.CORS_ORIGIN || '*'
app.use(cors({ origin: allowedOrigin }))

// Rate limiter (basic)
const limiter = rateLimit({ windowMs: 60 * 1000, max: 120 }) // 120 requests per minute
app.use(limiter)

// Serve uploaded files statically at /uploads
// Example: http://localhost:4000/uploads/1688881234-myfile.png
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
