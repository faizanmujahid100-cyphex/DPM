'use client'

import MainLayout from '@/components/layout/MainLayout'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useCart } from '@/contexts/CartContext'
import { ShoppingCart, Frame, Coffee, Shirt, Flag, CreditCard, Bookmark, Package } from 'lucide-react'
import { toast } from 'sonner'

const products = [
  { id: 'p1', name: 'Photo Frame Print', category: 'photo-frame', price: 350, desc: 'High-quality custom photo frames. Available in multiple sizes: 4x6, 5x7, 8x10, A4, A3.', icon: Frame, color: 'from-violet-500 to-purple-600', tag: 'Popular' },
  { id: 'p2', name: 'Custom Mug Print', category: 'mug', price: 250, desc: 'Personalized ceramic mugs with your custom design. Dishwasher safe, durable print.', icon: Coffee, color: 'from-orange-500 to-amber-600', tag: 'Bestseller' },
  { id: 'p3', name: 'T-Shirt Print', category: 'shirt', price: 800, desc: 'Full-color DTF printing on quality cotton t-shirts. All sizes available S–3XL.', icon: Shirt, color: 'from-pink-500 to-rose-600', tag: 'New' },
  { id: 'p4', name: 'Banner / Flex Print', category: 'banner', price: 500, desc: 'Large format flex/vinyl banners. Custom sizes, indoor/outdoor, with grommets.', icon: Flag, color: 'from-green-500 to-teal-600', tag: '' },
  { id: 'p5', name: 'Business Cards', category: 'business-card', price: 200, desc: 'Professional business cards with glossy/matte finish. 100pcs minimum order.', icon: CreditCard, color: 'from-blue-500 to-indigo-600', tag: 'Popular' },
  { id: 'p6', name: 'Stickers & Labels', category: 'sticker', price: 150, desc: 'Custom die-cut vinyl stickers and product labels. Waterproof, premium quality.', icon: Bookmark, color: 'from-red-500 to-orange-600', tag: '' },
  { id: 'p7', name: 'Brochure / Flyer', category: 'custom', price: 300, desc: 'A4/A5 brochures and flyers on premium paper stock. Single or double sided.', icon: Package, color: 'from-cyan-500 to-blue-600', tag: '' },
  { id: 'p8', name: 'Calendar Print', category: 'custom', price: 450, desc: 'Custom wall and desk calendars with your photos and branding. 12-month.', icon: Package, color: 'from-yellow-500 to-orange-500', tag: 'New' },
]

const categories = ['All', 'photo-frame', 'mug', 'shirt', 'banner', 'business-card', 'sticker', 'custom']
const categoryLabels: Record<string, string> = {
  'All': 'All Products',
  'photo-frame': 'Photo Frames',
  'mug': 'Mugs',
  'shirt': 'T-Shirts',
  'banner': 'Banners',
  'business-card': 'Business Cards',
  'sticker': 'Stickers',
  'custom': 'Custom',
}

import { useState } from 'react'

export default function ProductsPage() {
  const { addItem } = useCart()
  const [activeCategory, setActiveCategory] = useState('All')

  const filtered = activeCategory === 'All' ? products : products.filter(p => p.category === activeCategory)

  const handleAddToCart = (product: typeof products[0]) => {
    addItem({
      productId: product.id,
      productName: product.name,
      price: product.price,
      quantity: 1,
      imageUrl: '',
      category: product.category,
    })
    toast.success(`${product.name} added to cart!`)
  }

  return (
    <MainLayout>
      <section className="py-16 bg-gradient-to-br from-violet-950 via-purple-900 to-slate-900 text-white">
        <div className="container mx-auto px-4 text-center">
          <Badge className="mb-4 bg-white/10 text-white border-white/20">Our Products</Badge>
          <h1 className="text-5xl font-extrabold mb-4">
            Print <span className="bg-gradient-to-r from-orange-400 to-pink-400 bg-clip-text text-transparent">Products</span>
          </h1>
          <p className="text-violet-200 text-lg max-w-xl mx-auto">
            High-quality printing for every need. Select a product, place your order, and our designers will handle the rest.
          </p>
        </div>
      </section>

      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap gap-2 mb-8 justify-center">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  activeCategory === cat
                    ? 'bg-violet-600 text-white shadow-md'
                    : 'bg-white text-gray-600 border border-gray-200 hover:border-violet-300 hover:text-violet-600'
                }`}
              >
                {categoryLabels[cat]}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map(product => (
              <div key={product.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group flex flex-col">
                <div className={`bg-gradient-to-br ${product.color} h-36 flex items-center justify-center relative`}>
                  <product.icon className="w-16 h-16 text-white/80" />
                  {product.tag && (
                    <Badge className="absolute top-3 right-3 bg-white/20 text-white border-white/30 text-xs">
                      {product.tag}
                    </Badge>
                  )}
                </div>
                <div className="p-5 flex flex-col flex-1">
                  <h3 className="font-bold text-gray-900 mb-1">{product.name}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed mb-4 flex-1">{product.desc}</p>
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
        </div>
      </section>
    </MainLayout>
  )
}
