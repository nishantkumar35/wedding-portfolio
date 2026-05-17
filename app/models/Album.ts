import mongoose, { Schema, models } from 'mongoose'

const AlbumSchema = new Schema({
  name:      { type: String, required: true },
  slug:      { type: String, required: true, unique: true },
  coverUrl:  { type: String },
  createdAt: { type: Date, default: Date.now },
})

export const Album = models.Album ?? mongoose.model('Album', AlbumSchema)