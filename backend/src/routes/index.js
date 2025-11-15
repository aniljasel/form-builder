const express = require('express')
const router = express.Router()
const auth = require('./routes.auth')
const forms = require('./routes.forms')
const responses = require('./routes.responses')
router.use('/uploads', require('./routes.uploads'))

router.use('/auth', auth)
router.use('/forms', forms)
router.use('/responses', responses)

module.exports = router
