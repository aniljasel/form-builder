const express = require('express')
const router = express.Router()

router.use('/uploads', require('./routes.uploads'))
router.use('/auth', require('./routes.auth'))
router.use('/forms', require('./routes.forms'))
router.use('/responses', require('./routes.responses'))

module.exports = router
