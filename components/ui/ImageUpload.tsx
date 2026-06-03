'use client'

import { useRef, useEffect, useState } from 'react'
import { CldUploadWidget } from 'next-cloudinary'
import { Upload, X, ImageIcon, CheckCircle2 } from 'lucide-react'

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
  // Ref ensures we always call the latest onChange even if the widget caches the handler
  const onChangeRef = useRef(onChange)
  useEffect(() => { onChangeRef.current = onChange }, [onChange])

  // Local copy so the preview shows immediately on success without waiting for parent re-render
  const [localUrl, setLocalUrl] = useState(value)

  // Sync local if parent value changes (e.g. edit form opens with existing image)
  useEffect(() => { setLocalUrl(value) }, [value])

  const displayUrl = localUrl || value

  const handleSuccess = (results: any) => {
    const url: string =
      results?.info?.secure_url ??
      results?.secure_url ??
      ''

    if (url) {
      setLocalUrl(url)          // Show preview instantly
      onChangeRef.current(url)  // Update parent form state
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
        <div className="space-y-2">
          {displayUrl ? (
            /* ── Preview ── */
            <div className="relative w-full h-48 rounded-xl overflow-hidden border-2 border-green-200 group bg-gray-50">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={displayUrl} alt="Product" className="w-full h-full object-cover" />
              {/* Success badge */}
              <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-1 bg-green-500 text-white text-xs font-semibold rounded-full shadow">
                <CheckCircle2 className="w-3 h-3" />
                Image uploaded
              </div>
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => open()}
                  className="flex items-center gap-1.5 px-4 py-2 bg-white text-gray-800 rounded-lg text-sm font-semibold hover:bg-gray-100 shadow"
                >
                  <Upload className="w-4 h-4" />
                  Change
                </button>
                <button
                  type="button"
                  onClick={() => { setLocalUrl(''); onChangeRef.current('') }}
                  className="flex items-center gap-1.5 px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-semibold hover:bg-red-600 shadow"
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
