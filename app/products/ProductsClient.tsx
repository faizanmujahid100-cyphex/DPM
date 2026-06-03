'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import CloudImg from '@/components/ui/CloudImg'
import { useCart } from '@/contexts/CartContext'
import { getProducts, getCategories } from '@/lib/firestore'
import { Product, Category } from '@/types'
import { ShoppingCart, Package } from 'lucide-react'
import { toast } from 'sonner'

export default function ProductsClient() {
  const { addItem } = useCart()
  const searchParams = useSearchParams()
  const urlCategory = searchParams.get('category') ?? 'all'

  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState(urlCategory)

  useEffect(() => { setActiveCategory(urlCategory) }, [urlCategory])

  useEffect(() => {
    Promise.all([
      getProducts().then(p => p.filter(x => x.inStock)),
      getCategories(),
    ])
      .then(([p, c]) => { setProducts(p); setCategories(c) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const getCategoryColor = (slug: string) =>
    categories.find(c => c.slug === slug)?.color ?? 'from-violet-400 to-purple-500'

  const getCategoryName = (slug: string) =>
    categories.find(c => c.slug === slug)?.name ?? slug.replace('-', ' ')

  const filtered = activeCategory === 'all'
    ? products
    : products.filter(p => p.category === activeCategory)

  const handleAddToCart = (product: Product) => {
    addItem({ productId: product.id, productName: product.name, price: product.price, quantity: 1, imageUrl: product.imageUrl, category: product.category })
    toast.success(`${product.name} added to cart!`)
  }

  return (
    <>
      {/* Hero */}
      <section className="py-16 bg-gradient-to-br from-violet-950 via-purple-900 to-slate-900 text-white">
        <div className="container mx-auto px-4 text-center">
          <Badge className="mb-4 bg-white/10 text-white border-white/20">Our Products</Badge>
          <h1 className="text-5xl font-extrabold mb-4">
            Print <span className="bg-gradient-to-r from-orange-400 to-pink-400 bg-clip-text text-transparent">Products</span>
          </h1>
          <p className="text-violet-200 text-lg max-w-xl mx-auto">
            High-quality printing for every need. Add to cart and our designers will handle the rest.
          </p>
        </div>
      </section>

      <section className="py-10 bg-gray-50 min-h-[60vh]">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="flex justify-center py-24">
              <div className="w-8 h-8 border-2 border-violet-300 border-t-violet-600 rounded-full animate-spin" />
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-24 text-gray-400">
              <Package className="w-16 h-16 mx-auto mb-4 opacity-30" />
              <p className="text-xl font-semibold text-gray-500">No products available yet</p>
              <p className="text-sm mt-2">Check back soon!</p>
            </div>
          ) : (
            <>
              {categories.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-8 justify-center">
                  <button
                    onClick={() => setActiveCategory('all')}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${activeCategory === 'all' ? 'bg-violet-600 text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200 hover:border-violet-300 hover:text-violet-600'}`}
                  >
                    All Products
                  </button>
                  {categories.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => setActiveCategory(cat.slug)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${activeCategory === cat.slug ? 'bg-violet-600 text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200 hover:border-violet-300 hover:text-violet-600'}`}
                    >
                      {cat.imageUrl && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={cat.imageUrl} alt={cat.name} className="w-5 h-5 rounded-full object-cover" />
                      )}
                      {cat.name}
                    </button>
                  ))}
                </div>
              )}

              {filtered.length === 0 ? (
                <div className="text-center py-16 text-gray-400">
                  <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p className="font-medium">No products in this category yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filtered.map(product => (
                    <div key={product.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col">
                      <div className={`relative h-48 bg-gradient-to-br ${getCategoryColor(product.category)} flex items-center justify-center`}>
                        <CloudImg src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" fallback={<Package className="w-16 h-16 text-white/50" />} />
                        {product.featured && <Badge className="absolute top-3 left-3 bg-orange-500 text-white border-0 shadow-md">Featured</Badge>}
                      </div>
                      <div className="p-5 flex flex-col flex-1">
                        <div className="text-xs text-violet-600 font-medium mb-1 capitalize">{getCategoryName(product.category)}</div>
                        <h3 className="font-bold text-gray-900 mb-1">{product.name}</h3>
                        <p className="text-gray-500 text-sm leading-relaxed mb-4 flex-1 line-clamp-2">{product.description}</p>
                        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                          <div>
                            <div className="text-xs text-gray-400">Starting from</div>
                            <div className="text-violet-700 font-bold text-lg">PKR {product.price.toLocaleString()}</div>
                          </div>
                          <Button size="sm" onClick={() => handleAddToCart(product)} className="bg-violet-600 hover:bg-violet-700 text-white gap-1.5">
                            <ShoppingCart className="w-3.5 h-3.5" /> Add
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </>
  )
}
