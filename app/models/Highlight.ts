import mongoose, { Schema, models } from 'mongoose'

const HighlightItemSchema = new Schema({
  type:         { type: String, enum: ['photo', 'youtube'], required: true },
  order:        { type: Number, default: 0 },
  // photo fields
  publicId:     { type: String },
  url:          { type: String },        // full-res Cloudinary URL
  thumbnailUrl: { type: String },        // 400px thumbnail
  blurDataUrl:  { type: String },        // 20px inline blur placeholder
  caption:      { type: String, default: '' },
  // youtube fields
  youtubeId:    { type: String },        // e.g. "dQw4w9WgXcQ"
  youtubeTitle: { type: String },
}, { _id: true })

const HighlightSchema = new Schema({
  title:  { type: String, required: true },
  slug:   { type: String, required: true, unique: true },
  order:  { type: Number, default: 0 },
  // cover image — always a Cloudinary photo
  cover: {
    publicId:     { type: String, required: true },
    url:          { type: String, required: true },
    thumbnailUrl: { type: String, required: true },
    blurDataUrl:  { type: String },
  },
  // mixed array of photos and youtube links
  items: [HighlightItemSchema],
  createdAt: { type: Date, default: Date.now },
})

export const Highlight = models.Highlight ?? mongoose.model('Highlight', HighlightSchema)