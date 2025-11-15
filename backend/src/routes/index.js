const express = require('express')
const router = express.Router()

// mount uploads early (optional)
router.use('/uploads', require('./routes.uploads'))

// auth, forms, responses
router.use('/auth', require('./routes.auth'))
router.use('/forms', require('./routes.forms'))
router.use('/responses', require('./routes.responses'))

module.exports = router
