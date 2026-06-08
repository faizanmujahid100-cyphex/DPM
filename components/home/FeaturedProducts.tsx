'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import CloudImg from '@/components/ui/CloudImg'
import { useCart } from '@/contexts/CartContext'
import { getProducts } from '@/lib/firestore'
import { Product } from '@/types'
import { ArrowRight, ShoppingCart, Package } from 'lucide-react'
import { toast } from 'sonner'

const gradients: Record<string, string> = {
  'photo-frame': 'from-violet-500 to-purple-600',
  'mug': 'from-orange-500 to-amber-600',
  'shirt': 'from-pink-500 to-rose-600',
  'banner': 'from-green-500 to-teal-600',
  'business-card': 'from-blue-500 to-indigo-600',
  'sticker': 'from-red-500 to-orange-600',
  'custom': 'from-cyan-500 to-blue-600',
}

export default function FeaturedProducts() {
  const { addItem } = useCart()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getProducts()
      .then(all => {
        const featured = all.filter(p => p.inStock)
        setProducts(featured.slice(0, 6))
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4 flex justify-center">
        <div className="w-8 h-8 border-2 border-violet-300 border-t-violet-600 rounded-full animate-spin" />
      </div>
    </section>
  )

  if (products.length === 0) return null

  const handleAddToCart = (product: Product, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    addItem({ productId: product.id, productName: product.name, price: product.price, quantity: 1, imageUrl: product.imageUrl, category: product.category })
    toast.success(`${product.name} added to cart!`)
  }

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <Badge className="mb-3 bg-violet-100 text-violet-700 border-violet-200">Our Products</Badge>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Print Anything, <span className="text-violet-600">Perfectly</span>
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto">From custom mugs to large banners, we print with precision and passion.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          {products.map(product => (
            <Link key={product.id} href={`/products/${product.id}`}
              className="group bg-gray-50 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-100 hover:-translate-y-1 flex flex-col cursor-pointer">
              <div className={`relative aspect-[4/3] bg-gradient-to-br ${gradients[product.category] ?? 'from-violet-500 to-purple-600'} flex items-center justify-center`}>
                <CloudImg
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full h-full object-contain"
                  fallback={<Package className="w-14 h-14 text-white/50" />}
                />
                {product.featured && (
                  <Badge className="absolute top-3 left-3 bg-orange-500 text-white border-0 shadow">Featured</Badge>
                )}
              </div>
              <div className="p-5 flex flex-col flex-1">
                <div className="text-xs text-gray-400 capitalize mb-1">{product.category.replace('-', ' ')}</div>
                <h3 className="font-bold text-gray-900 mb-1 group-hover:text-violet-700 transition-colors">{product.name}</h3>
                <p className="text-gray-500 text-sm mb-4 flex-1 line-clamp-2">{product.description}</p>
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <div className="text-violet-700 font-bold">PKR {product.price.toLocaleString()}</div>
                  <Button size="sm" onClick={e => handleAddToCart(product, e)} className="bg-violet-600 hover:bg-violet-700 text-white gap-1.5">
                    <ShoppingCart className="w-3.5 h-3.5" /> Add
                  </Button>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="text-center">
          <Link href="/products">
            <Button className="bg-violet-600 hover:bg-violet-700 text-white px-8 group">
              View All Products
              <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
