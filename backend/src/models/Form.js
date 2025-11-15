const mongoose = require('mongoose')
const { Schema } = mongoose

const FieldSchema = new Schema({
  id: { type: String, required: true },
  type: { type: String, required: true },
  label: String,
  placeholder: String,
  required: { type: Boolean, default: false },
  options: [String],
  validation: Schema.Types.Mixed,
  styles: Schema.Types.Mixed,
  conditional: Schema.Types.Mixed
}, { _id: false })

const FormSchema = new Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: String,
  settings: { type: Schema.Types.Mixed, default: {} },
  fields: [FieldSchema],
  createdBy: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  archived: { type: Boolean, default: false }
})

FormSchema.pre('save', function(next) {
  this.updatedAt = Date.now()
  next()
})

module.exports = mongoose.model('Form', FormSchema)
