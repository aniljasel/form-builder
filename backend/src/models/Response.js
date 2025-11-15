const mongoose = require('mongoose')
const { Schema } = mongoose

const ResponseSchema = new Schema({
  formId: { type: Schema.Types.ObjectId, ref: 'Form', required: true },
  submittedAt: { type: Date, default: Date.now },
  values: { type: Schema.Types.Mixed }, // { fieldId: value }
  ip: String,
  userAgent: String,
  meta: Schema.Types.Mixed
})

module.exports = mongoose.model('Response', ResponseSchema)
