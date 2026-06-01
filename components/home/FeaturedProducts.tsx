import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowRight, Frame, Coffee, Shirt, Flag, CreditCard, Bookmark } from 'lucide-react'

const products = [
  { name: 'Photo Frame Prints', desc: 'High-quality custom photo frames for every occasion', price: 'From PKR 350', icon: Frame, color: 'from-violet-500 to-purple-600', tag: 'Popular' },
  { name: 'Custom Mug Prints', desc: 'Personalized mugs perfect for gifts and branding', price: 'From PKR 250', icon: Coffee, color: 'from-orange-500 to-amber-600', tag: 'Bestseller' },
  { name: 'T-Shirt Printing', desc: 'Full-color custom shirt printing for all sizes', price: 'From PKR 800', icon: Shirt, color: 'from-pink-500 to-rose-600', tag: 'New' },
  { name: 'Banner & Flex', desc: 'Large format printing for events and advertising', price: 'From PKR 500/sqft', icon: Flag, color: 'from-green-500 to-teal-600', tag: '' },
  { name: 'Business Cards', desc: 'Professional business cards with premium finish', price: 'From PKR 200/100pcs', icon: CreditCard, color: 'from-blue-500 to-indigo-600', tag: 'Popular' },
  { name: 'Stickers & Labels', desc: 'Custom die-cut stickers and product labels', price: 'From PKR 150', icon: Bookmark, color: 'from-red-500 to-orange-600', tag: '' },
]

export default function FeaturedProducts() {
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
          {products.map(({ name, desc, price, icon: Icon, color, tag }) => (
            <div key={name} className="group relative bg-gray-50 rounded-2xl p-6 hover:shadow-xl transition-all duration-300 border border-gray-100 hover:-translate-y-1 overflow-hidden">
              <div className="absolute top-0 right-0 w-28 h-28 opacity-5 -translate-y-4 translate-x-4">
                <Icon className="w-full h-full" />
              </div>
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-4 shadow-lg`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              {tag && (
                <Badge className="mb-2 text-xs bg-orange-100 text-orange-600 border-orange-200">{tag}</Badge>
              )}
              <h3 className="font-bold text-gray-900 text-lg mb-1">{name}</h3>
              <p className="text-gray-500 text-sm mb-3 leading-relaxed">{desc}</p>
              <p className="text-violet-700 font-semibold text-sm">{price}</p>
            </div>
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
