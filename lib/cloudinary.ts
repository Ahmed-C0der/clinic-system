// lib/cloudinary.ts
import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function uploadMedicalFile(
  buffer: Buffer,
  fileName: string,
  patientId: string
) {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      {
        folder:    `clinic/patients/${patientId}`,
        public_id: `${Date.now()}-${fileName}`,
        resource_type: 'auto',      // PDF + images
        access_mode: 'authenticated' // ← مش public!
      },
      (error, result) => {
        if (error) reject(error)
        else resolve(result)
      }
    ).end(buffer)
  })
}