import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function uploadImage(file: Buffer, folder: string) {
  return new Promise<{ publicId: string; url: string; thumbnailUrl: string; blurDataUrl: string }>(
    (resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: 'image',
          // Auto-convert to WebP/AVIF, compress intelligently
          transformation: [{ quality: 'auto', fetch_format: 'auto' }],
          eager: [
            // Pre-generate a 400px thumbnail immediately on upload
            { width: 400, quality: 'auto', fetch_format: 'auto', crop: 'fill' },
          ],
          eager_async: false,
        },
        async (err, result) => {
          if (err || !result) return reject(err)

          const thumbnailUrl = result.eager?.[0]?.secure_url ??
            buildUrl(result.public_id, { width: 400, quality: 'auto', fetch_format: 'auto' })

          // Tiny 20px blur placeholder (base64 inline, no extra request)
          const blurDataUrl = buildUrl(result.public_id, {
            width: 20, quality: 1, fetch_format: 'auto', effect: 'blur:200',
          })

          resolve({
            publicId:     result.public_id,
            url:          result.secure_url,
            thumbnailUrl,
            blurDataUrl,
          })
        }
      )
      stream.end(file)
    }
  )
}

export function buildUrl(publicId: string, opts: Record<string, any> = {}) {
  return cloudinary.url(publicId, { secure: true, ...opts })
}

export async function deleteAsset(publicId: string, resourceType: 'image' | 'video' = 'image') {
  return cloudinary.uploader.destroy(publicId, { resource_type: resourceType })
}

export { cloudinary }