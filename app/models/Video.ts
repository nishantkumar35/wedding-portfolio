import mongoose, { Schema, models } from 'mongoose'

const VideoSchema = new Schema({
  youtubeId:  { type: String, required: true },
  title:      { type: String, required: true },
  caption:    { type: String, default: '' },
  order:      { type: Number, default: 0 },
  createdAt:  { type: Date, default: Date.now },
})

export const Video = models.Video ?? mongoose.model('Video', VideoSchema)