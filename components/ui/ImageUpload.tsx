'use client'

import { CldUploadWidget } from 'next-cloudinary'
import type { CloudinaryUploadWidgetResults } from 'next-cloudinary'
import { Upload, X, ImageIcon } from 'lucide-react'

interface ImageUploadProps {
  value: string
  onChange: (url: string) => void
  label?: string
  folder?: string
}

export default function ImageUpload({
  value,
  onChange,
  label = 'Upload Image',
  folder = 'dpm',
}: ImageUploadProps) {

  const handleSuccess = (results: CloudinaryUploadWidgetResults) => {
    const info = results?.info
    if (info && typeof info === 'object' && 'secure_url' in info) {
      onChange(String((info as { secure_url: string }).secure_url))
    }
  }

  return (
    <CldUploadWidget
      uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET}
      options={{
        folder,
        maxFiles: 1,
        sources: ['local', 'camera'],
        resourceType: 'image',
        clientAllowedFormats: ['jpg', 'jpeg', 'png', 'webp'],
      }}
      onSuccess={handleSuccess}
    >
      {({ open }) => (
        <div>
          {value ? (
            /* ── Preview ── */
            <div className="relative w-full h-48 rounded-xl overflow-hidden border border-gray-200 group bg-gray-50">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={value}
                alt="Product"
                className="w-full h-full object-cover"
              />
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => open()}
                  className="flex items-center gap-1.5 px-4 py-2 bg-white text-gray-800 rounded-lg text-sm font-semibold hover:bg-gray-100 transition-colors shadow"
                >
                  <Upload className="w-4 h-4" />
                  Change
                </button>
                <button
                  type="button"
                  onClick={() => onChange('')}
                  className="flex items-center gap-1.5 px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-semibold hover:bg-red-600 transition-colors shadow"
                >
                  <X className="w-4 h-4" />
                  Remove
                </button>
              </div>
            </div>
          ) : (
            /* ── Upload button ── */
            <button
              type="button"
              onClick={() => open()}
              className="w-full h-48 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center gap-3 hover:border-violet-400 hover:bg-violet-50 transition-all cursor-pointer"
            >
              <div className="w-12 h-12 rounded-full bg-violet-100 flex items-center justify-center">
                <ImageIcon className="w-6 h-6 text-violet-600" />
              </div>
              <div className="text-center">
                <div className="text-sm font-semibold text-gray-700">{label}</div>
                <div className="text-xs text-gray-400 mt-0.5">JPG, PNG or WebP — max 10MB</div>
              </div>
              <div className="flex items-center gap-1.5 px-4 py-2 bg-violet-600 text-white rounded-lg text-sm font-semibold">
                <Upload className="w-4 h-4" />
                Choose Image
              </div>
            </button>
          )}
        </div>
      )}
    </CldUploadWidget>
  )
}
