const express = require('express')
const multer = require('multer')
const path = require('path')
const router = express.Router()

// store files locally in /uploads with original filename prefixed by timestamp
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../../uploads'))
  },
  filename: function (req, file, cb) {
    const safe = Date.now() + '-' + file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, '_')
    cb(null, safe)
  }
})

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: function (req, file, cb) {
    // optional: limit types, for now accept all
    cb(null, true)
  }
})

// single file upload
router.post('/', upload.single('file'), (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'no file' })
    // Build public URL - assumes server serves /uploads statically
    const host = req.protocol + '://' + req.get('host')
    const url = `${host}/uploads/${encodeURIComponent(req.file.filename)}`
    res.json({ ok: true, url, filename: req.file.filename, originalname: req.file.originalname })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'upload failed' })
  }
})

module.exports = router
