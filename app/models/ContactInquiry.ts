import mongoose, { Schema, models } from 'mongoose'

const ContactInquirySchema = new Schema({
  firstName:   { type: String, required: true },
  lastName:    { type: String },
  email:       { type: String, required: true },
  phone:       { type: String },
  weddingDate: { type: String },
  location:    { type: String },
  package:     { type: String },
  message:     { type: String },
  status:      { type: String, enum: ['new', 'read', 'replied'], default: 'new' },
  createdAt:   { type: Date, default: Date.now },
})

export const ContactInquiry =
  models.ContactInquiry ?? mongoose.model('ContactInquiry', ContactInquirySchema)
