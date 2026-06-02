import { NextResponse } from 'next/server'
import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function GET() {
  try {
    // Create the unsigned upload preset
    const result = await cloudinary.api.create_upload_preset({
      name: 'dpm_uploads',
      unsigned: true,
      folder: 'dpm',
      allowed_formats: 'jpg,jpeg,png,webp,gif',
      max_file_size: 10485760, // 10MB
    })

    return NextResponse.json({ success: true, preset: result.name })
  } catch (error: any) {
    // If preset already exists, that's fine
    if (error?.error?.message?.includes('already exists') || error?.message?.includes('already exists')) {
      return NextResponse.json({ success: true, message: 'Preset already exists' })
    }
    return NextResponse.json({ success: false, error: error?.error?.message || error?.message }, { status: 500 })
  }
}
