'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getCategories } from '@/lib/firestore'
import { Category } from '@/types'
import { Badge } from '@/components/ui/badge'
import { ImageIcon } from 'lucide-react'

export default function CategoriesSection() {
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getCategories().then(setCategories).catch(() => {}).finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4 flex justify-center">
        <div className="w-8 h-8 border-2 border-violet-300 border-t-violet-600 rounded-full animate-spin" />
      </div>
    </section>
  )

  if (categories.length === 0) return null

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-14">
          <Badge className="mb-3 bg-violet-100 text-violet-700 border-violet-200">Shop by Category</Badge>
          <h2 className="text-4xl font-extrabold text-gray-900 mb-3">
            What Are You Looking{' '}
            <span className="bg-gradient-to-r from-violet-600 to-orange-500 bg-clip-text text-transparent">For?</span>
          </h2>
          <p className="text-gray-500 max-w-lg mx-auto">Browse our printing categories and find exactly what you need.</p>
        </div>

        {/* Category circles */}
        <div className="flex flex-wrap justify-center gap-8 md:gap-12">
          {categories.map((cat, i) => (
            <button
              key={cat.id}
              onClick={() => router.push(`/products?category=${cat.slug}`)}
              className="flex flex-col items-center gap-3 group outline-none"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              {/* Circle */}
              <div className="relative">
                {/* Glow ring on hover */}
                <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${cat.color || 'from-violet-500 to-purple-600'} blur-md opacity-0 group-hover:opacity-50 transition-opacity duration-300 scale-110`} />

                {/* Main circle */}
                <div className={`relative w-28 h-28 md:w-32 md:h-32 rounded-full overflow-hidden bg-gradient-to-br ${cat.color || 'from-violet-500 to-purple-600'} shadow-lg group-hover:shadow-2xl group-hover:scale-110 transition-all duration-300 flex items-center justify-center ring-4 ring-white`}>
                  {cat.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={cat.imageUrl}
                      alt={cat.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <ImageIcon className="w-10 h-10 text-white/70" />
                  )}

                  {/* Subtle overlay on hover */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 rounded-full" />
                </div>
              </div>

              {/* Label */}
              <div className="text-center">
                <div className="font-semibold text-gray-800 text-sm md:text-base group-hover:text-violet-700 transition-colors duration-200 leading-tight">
                  {cat.name}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
