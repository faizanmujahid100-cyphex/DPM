'use client'

import MainLayout from '@/components/layout/MainLayout'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useCart } from '@/contexts/CartContext'
import { getProducts } from '@/lib/firestore'
import { Product } from '@/types'
import { useEffect, useState } from 'react'
import { ShoppingCart, Package } from 'lucide-react'
import { toast } from 'sonner'
import Image from 'next/image'

const categoryLabels: Record<string, string> = {
  'all': 'All Products',
  'photo-frame': 'Photo Frames',
  'mug': 'Mugs',
  'shirt': 'T-Shirts',
  'banner': 'Banners',
  'business-card': 'Business Cards',
  'sticker': 'Stickers',
  'custom': 'Custom',
}

const categoryGradients: Record<string, string> = {
  'photo-frame': 'from-violet-500 to-purple-600',
  'mug': 'from-orange-500 to-amber-600',
  'shirt': 'from-pink-500 to-rose-600',
  'banner': 'from-green-500 to-teal-600',
  'business-card': 'from-blue-500 to-indigo-600',
  'sticker': 'from-red-500 to-orange-600',
  'custom': 'from-cyan-500 to-blue-600',
}

export default function ProductsPage() {
  const { addItem } = useCart()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState('all')

  useEffect(() => {
    getProducts().then(setProducts).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const categories = ['all', ...Array.from(new Set(products.map(p => p.category)))]
  const filtered = activeCategory === 'all' ? products.filter(p => p.inStock) : products.filter(p => p.category === activeCategory && p.inStock)

  const handleAddToCart = (product: Product) => {
    addItem({
      productId: product.id,
      productName: product.name,
      price: product.price,
      quantity: 1,
      imageUrl: product.imageUrl,
      category: product.category,
    })
    toast.success(`${product.name} added to cart!`)
  }

  return (
    <MainLayout>
      {/* Hero */}
      <section className="py-16 bg-gradient-to-br from-violet-950 via-purple-900 to-slate-900 text-white">
        <div className="container mx-auto px-4 text-center">
          <Badge className="mb-4 bg-white/10 text-white border-white/20">Our Products</Badge>
          <h1 className="text-5xl font-extrabold mb-4">
            Print <span className="bg-gradient-to-r from-orange-400 to-pink-400 bg-clip-text text-transparent">Products</span>
          </h1>
          <p className="text-violet-200 text-lg max-w-xl mx-auto">
            High-quality printing for every need. Place your order and our designers will handle the rest.
          </p>
        </div>
      </section>

      <section className="py-12 bg-gray-50 min-h-[60vh]">
        <div className="container mx-auto px-4">
          {/* Category filter */}
          <div className="flex flex-wrap gap-2 mb-8 justify-center">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all capitalize ${
                  activeCategory === cat
                    ? 'bg-violet-600 text-white shadow-md'
                    : 'bg-white text-gray-600 border border-gray-200 hover:border-violet-300 hover:text-violet-600'
                }`}
              >
                {categoryLabels[cat] ?? cat.replace('-', ' ')}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-8 h-8 border-2 border-violet-300 border-t-violet-600 rounded-full animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <Package className="w-12 h-12 mx-auto mb-4 opacity-40" />
              <p className="text-lg font-medium">No products found.</p>
              <p className="text-sm mt-1">Check back soon — the admin is adding products.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filtered.map(product => (
                <div key={product.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group flex flex-col">
                  {/* Image */}
                  <div className={`relative h-44 bg-gradient-to-br ${categoryGradients[product.category] ?? 'from-violet-400 to-purple-600'} flex items-center justify-center`}>
                    {product.imageUrl ? (
                      <Image src={product.imageUrl} alt={product.name} fill className="object-cover" />
                    ) : (
                      <Package className="w-16 h-16 text-white/60" />
                    )}
                    {product.featured && (
                      <Badge className="absolute top-3 left-3 bg-orange-500 text-white border-0 shadow-md">Featured</Badge>
                    )}
                  </div>

                  <div className="p-5 flex flex-col flex-1">
                    <div className="text-xs text-gray-400 capitalize mb-1">{product.category.replace('-', ' ')}</div>
                    <h3 className="font-bold text-gray-900 mb-1">{product.name}</h3>
                    <p className="text-gray-500 text-sm leading-relaxed mb-4 flex-1 line-clamp-2">{product.description}</p>
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <div>
                        <div className="text-xs text-gray-400">Starting from</div>
                        <div className="text-violet-700 font-bold text-lg">PKR {product.price.toLocaleString()}</div>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleAddToCart(product)}
                        className="bg-violet-600 hover:bg-violet-700 text-white gap-1.5"
                      >
                        <ShoppingCart className="w-3.5 h-3.5" />
                        Add
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </MainLayout>
  )
}
