'use client'

import { useState } from 'react'
import { CldUploadWidget, CloudinaryUploadWidgetResults } from 'next-cloudinary'
import { Upload, X, ImageIcon, Loader2 } from 'lucide-react'
import Image from 'next/image'

interface ImageUploadProps {
  value: string
  onChange: (url: string) => void
  label?: string
  folder?: string
}

function extractUrl(results: CloudinaryUploadWidgetResults): string | null {
  const info = results?.info
  if (info && typeof info === 'object' && 'secure_url' in info) {
    return info.secure_url
  }
  return null
}

function UploadButton({ onSuccess, folder, children }: {
  onSuccess: (url: string) => void
  folder: string
  children: (open: () => void) => React.ReactNode
}) {
  return (
    <CldUploadWidget
      uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET}
      options={{
        folder,
        maxFiles: 1,
        resourceType: 'image',
        clientAllowedFormats: ['jpg', 'jpeg', 'png', 'webp'],
        sources: ['local', 'camera'],
      }}
      onSuccess={(results: CloudinaryUploadWidgetResults) => {
        const url = extractUrl(results)
        if (url) onSuccess(url)
      }}
    >
      {({ open }) => <>{children(open)}</>}
    </CldUploadWidget>
  )
}

export default function ImageUpload({
  value,
  onChange,
  label = 'Upload Image',
  folder = 'dpm',
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)

  if (value) {
    return (
      <div className="relative w-full h-48 rounded-xl overflow-hidden border border-gray-200 bg-gray-50 group">
        <Image src={value} alt="Uploaded image" fill className="object-cover" unoptimized />
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <UploadButton folder={folder} onSuccess={url => onChange(url)}>
            {open => (
              <button
                type="button"
                onClick={open}
                className="flex items-center gap-1.5 px-3 py-2 bg-white text-gray-800 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors"
              >
                <Upload className="w-4 h-4" />
                Change
              </button>
            )}
          </UploadButton>
          <button
            type="button"
            onClick={() => onChange('')}
            className="flex items-center gap-1.5 px-3 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-colors"
          >
            <X className="w-4 h-4" />
            Remove
          </button>
        </div>
      </div>
    )
  }

  return (
    <UploadButton
      folder={folder}
      onSuccess={url => { onChange(url); setUploading(false) }}
    >
      {open => (
        <button
          type="button"
          onClick={() => { setUploading(true); open() }}
          disabled={uploading}
          className="w-full h-48 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center gap-3 hover:border-violet-400 hover:bg-violet-50 transition-all group cursor-pointer disabled:opacity-60"
        >
          {uploading ? (
            <>
              <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
              <span className="text-sm text-gray-500">Opening uploader...</span>
            </>
          ) : (
            <>
              <div className="w-12 h-12 rounded-full bg-violet-100 flex items-center justify-center group-hover:bg-violet-200 transition-colors">
                <ImageIcon className="w-6 h-6 text-violet-600" />
              </div>
              <div className="text-center">
                <div className="text-sm font-semibold text-gray-700">{label}</div>
                <div className="text-xs text-gray-400 mt-0.5">JPG, PNG or WebP — max 10MB</div>
              </div>
              <div className="flex items-center gap-1.5 px-4 py-2 bg-violet-600 text-white rounded-lg text-sm font-medium group-hover:bg-violet-700 transition-colors">
                <Upload className="w-4 h-4" />
                Choose Image
              </div>
            </>
          )}
        </button>
      )}
    </UploadButton>
  )
}
