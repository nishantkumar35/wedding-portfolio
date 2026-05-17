import mongoose, { Schema, models } from 'mongoose'

const PhotoSchema = new Schema({
  albumId:      { type: Schema.Types.ObjectId, ref: 'Album', required: true },
  publicId:     { type: String, required: true },
  url:          { type: String, required: true },   // full-res (auto quality)
  thumbnailUrl: { type: String, required: true },   // 400px, used in grid
  blurDataUrl:  { type: String },                   // 20px inline blur placeholder
  caption:      { type: String, default: '' },
  createdAt:    { type: Date, default: Date.now },
})

export const Photo = models.Photo ?? mongoose.model('Photo', PhotoSchema)