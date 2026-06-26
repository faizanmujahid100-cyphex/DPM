'use client'

import { useRef } from 'react'
import { CldUploadWidget } from 'next-cloudinary'
import { Upload, X, ImageIcon, Plus, Star } from 'lucide-react'

const MAX_IMAGES = 5

interface MultiImageUploadProps {
  values: string[]
  onChange: (urls: string[]) => void
  folder?: string
}

export default function MultiImageUpload({
  values,
  onChange,
  folder = 'dpm/products',
}: MultiImageUploadProps) {
  const valuesRef = useRef(values)
  valuesRef.current = values

  const remaining = MAX_IMAGES - values.length

  const handleSuccess = (results: any) => {
    const url: string = results?.info?.secure_url ?? results?.secure_url ?? ''
    if (url) onChange([...valuesRef.current, url])
  }

  const remove = (i: number) => {
    const next = values.filter((_, j) => j !== i)
    onChange(next)
  }

  const moveFirst = (i: number) => {
    const next = [...values]
    const [item] = next.splice(i, 1)
    next.unshift(item)
    onChange(next)
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-gray-400">
        Upload up to {MAX_IMAGES} images. The <span className="font-semibold text-violet-600">first image</span> is the main/thumbnail.
        {values.length > 0 && ` (${values.length}/${MAX_IMAGES} uploaded)`}
      </p>

      {/* Thumbnails grid */}
      {values.length > 0 && (
        <div className="grid grid-cols-5 gap-2">
          {values.map((url, i) => (
            <div key={url} className="relative group">
              <div className={`aspect-square rounded-xl overflow-hidden border-2 ${i === 0 ? 'border-violet-400 shadow-md' : 'border-gray-200'}`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt={`Image ${i + 1}`} className="w-full h-full object-cover" />
              </div>
              {i === 0 && (
                <div className="absolute top-1 left-1 bg-violet-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5 shadow">
                  <Star className="w-2.5 h-2.5 fill-white" /> Main
                </div>
              )}
              {/* Hover controls */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex flex-col items-center justify-center gap-1">
                {i !== 0 && (
                  <button
                    type="button"
                    onClick={() => moveFirst(i)}
                    className="text-[10px] font-semibold text-white bg-violet-600 px-2 py-1 rounded-full hover:bg-violet-700 transition-colors"
                  >
                    Set Main
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => remove(i)}
                  className="w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}

          {/* Add slot */}
          {remaining > 0 && (
            <CldUploadWidget
              key={`upload-slot-${values.length}`}
              uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET}
              options={{
                folder,
                maxFiles: remaining,
                multiple: remaining > 1,
                sources: ['local', 'camera'],
                resourceType: 'image',
                clientAllowedFormats: ['jpg', 'jpeg', 'png', 'webp'],
              }}
              onSuccess={handleSuccess}
            >
              {({ open }) => (
                <button
                  type="button"
                  onClick={() => open()}
                  className="aspect-square rounded-xl border-2 border-dashed border-violet-300 hover:border-violet-500 hover:bg-violet-50 flex flex-col items-center justify-center gap-1 transition-all text-violet-400 hover:text-violet-600"
                >
                  <Plus className="w-5 h-5" />
                  <span className="text-[10px] font-semibold">{remaining} left</span>
                </button>
              )}
            </CldUploadWidget>
          )}
        </div>
      )}

      {/* Empty state — full upload button */}
      {values.length === 0 && (
        <CldUploadWidget
          key="upload-empty"
          uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET}
          options={{
            folder,
            maxFiles: MAX_IMAGES,
            multiple: true,
            sources: ['local', 'camera'],
            resourceType: 'image',
            clientAllowedFormats: ['jpg', 'jpeg', 'png', 'webp'],
          }}
          onSuccess={handleSuccess}
        >
          {({ open }) => (
            <button
              type="button"
              onClick={() => open()}
              className="w-full h-44 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center gap-3 hover:border-violet-400 hover:bg-violet-50 transition-all cursor-pointer"
            >
              <div className="w-12 h-12 rounded-full bg-violet-100 flex items-center justify-center">
                <ImageIcon className="w-6 h-6 text-violet-600" />
              </div>
              <div className="text-center">
                <div className="text-sm font-semibold text-gray-700">Upload Product Images</div>
                <div className="text-xs text-gray-400 mt-0.5">Up to {MAX_IMAGES} images — JPG, PNG or WebP</div>
              </div>
              <div className="flex items-center gap-1.5 px-4 py-2 bg-violet-600 text-white rounded-lg text-sm font-semibold">
                <Upload className="w-4 h-4" />
                Choose Images
              </div>
            </button>
          )}
        </CldUploadWidget>
      )}
    </div>
  )
}
