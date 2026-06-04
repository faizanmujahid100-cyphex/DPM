'use client'

import { useRef, useEffect, useState } from 'react'
import { CldUploadWidget } from 'next-cloudinary'
import { Camera, X } from 'lucide-react'

interface AvatarUploadProps {
  value: string
  onChange: (url: string) => void
  initials?: string
}

export default function AvatarUpload({ value, onChange, initials = '?' }: AvatarUploadProps) {
  const onChangeRef = useRef(onChange)
  useEffect(() => { onChangeRef.current = onChange }, [onChange])

  const [localUrl, setLocalUrl] = useState(value)
  useEffect(() => { setLocalUrl(value) }, [value])

  const displayUrl = localUrl || value

  const handleSuccess = (results: any) => {
    const url: string = results?.info?.secure_url ?? results?.secure_url ?? ''
    if (url) {
      setLocalUrl(url)
      onChangeRef.current(url)
    }
  }

  return (
    <CldUploadWidget
      uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET}
      options={{
        folder: 'dpm/avatars',
        maxFiles: 1,
        sources: ['local', 'camera'],
        resourceType: 'image',
        clientAllowedFormats: ['jpg', 'jpeg', 'png', 'webp'],
      }}
      onSuccess={handleSuccess}
    >
      {({ open }) => (
        <div className="relative w-20 h-20 shrink-0 group">
          {displayUrl ? (
            <img
              src={displayUrl}
              alt="Profile"
              className="w-20 h-20 rounded-full object-cover border-2 border-violet-200"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold border-2 border-violet-200">
              {initials}
            </div>
          )}

          {/* Edit overlay */}
          <button
            type="button"
            onClick={() => open()}
            className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
            title="Change photo"
          >
            <Camera className="w-5 h-5 text-white" />
          </button>

          {/* Remove button — only shown when there's a photo */}
          {displayUrl && (
            <button
              type="button"
              onClick={() => { setLocalUrl(''); onChangeRef.current('') }}
              className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow"
              title="Remove photo"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      )}
    </CldUploadWidget>
  )
}
