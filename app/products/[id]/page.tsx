'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { getProductById, getCategories } from '@/lib/firestore'
import { Product, Category, ProductVariant } from '@/types'
import { useCart } from '@/contexts/CartContext'
import MainLayout from '@/components/layout/MainLayout'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { ShoppingCart, ArrowLeft, Check, Minus, Plus, Package, Star } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { addItem } = useCart()

  const [product,    setProduct]    = useState<Product | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [loading,    setLoading]    = useState(true)
  const [selectedColor,   setSelectedColor]   = useState<ProductVariant | null>(null)
  const [selectedPackage, setSelectedPackage] = useState<ProductVariant | null>(null)
  const [quantity, setQuantity] = useState(1)

  useEffect(() => {
    Promise.all([getProductById(id), getCategories()])
      .then(([p, c]) => {
        setProduct(p)
        setCategories(c)
        if (p?.variants) {
          const firstColor = p.variants.find(v => v.type === 'color')
          const firstPkg   = p.variants.find(v => v.type === 'package')
          if (firstColor) setSelectedColor(firstColor)
          if (firstPkg)   setSelectedPackage(firstPkg)
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [id])

  const colorVariants   = product?.variants?.filter(v => v.type === 'color')   ?? []
  const packageVariants = product?.variants?.filter(v => v.type === 'package') ?? []

  // Price priority: package > color > base
  const displayPrice = selectedPackage?.price ?? selectedColor?.price ?? product?.price ?? 0

  const variantSummary = [selectedColor?.label, selectedPackage?.label].filter(Boolean).join(' + ')

  const getCategoryName = (slug: string) =>
    categories.find(c => c.slug === slug)?.name ?? slug.replace(/-/g, ' ')
  const getCategoryColor = (slug: string) =>
    categories.find(c => c.slug === slug)?.color ?? 'from-violet-400 to-purple-500'

  const handleAddToCart = () => {
    if (!product) return
    addItem({
      productId: product.id,
      productName: product.name + (variantSummary ? ` (${variantSummary})` : ''),
      price: displayPrice,
      quantity,
      imageUrl: product.imageUrl,
      category: product.category,
      variantLabel: variantSummary || undefined,
    })
    toast.success(`Added to cart!`)
  }

  if (loading) return (
    <MainLayout>
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-violet-300 border-t-violet-600 rounded-full animate-spin" />
      </div>
    </MainLayout>
  )

  if (!product) return (
    <MainLayout>
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-gray-400">
        <Package className="w-16 h-16 opacity-30" />
        <p className="text-xl font-semibold">Product not found</p>
        <Link href="/products">
          <Button variant="outline" className="gap-2"><ArrowLeft className="w-4 h-4" /> Back to Products</Button>
        </Link>
      </div>
    </MainLayout>
  )

  return (
    <MainLayout>
      <div className="bg-gray-50 min-h-screen">
        <div className="container mx-auto px-4 py-8 max-w-6xl">

          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-gray-400 mb-6">
            <Link href="/" className="hover:text-violet-600 transition-colors">Home</Link>
            <span>/</span>
            <Link href="/products" className="hover:text-violet-600 transition-colors">Products</Link>
            <span>/</span>
            <span className="text-gray-700 font-medium truncate">{product.name}</span>
          </nav>

          {/* Main grid */}
          <div className="grid lg:grid-cols-2 gap-10 items-start">

            {/* ── Left: Image ── */}
            <div className="sticky top-24">
              <div className={`relative aspect-square rounded-2xl overflow-hidden bg-gradient-to-br ${getCategoryColor(product.category)} shadow-lg`}>
                {product.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="w-24 h-24 text-white/40" />
                  </div>
                )}
                {product.featured && (
                  <div className="absolute top-4 left-4 flex items-center gap-1 px-3 py-1.5 bg-orange-500 text-white text-xs font-semibold rounded-full shadow-lg">
                    <Star className="w-3 h-3 fill-white" /> Featured
                  </div>
                )}
                {!product.inStock && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <span className="px-4 py-2 bg-red-500 text-white font-bold rounded-xl text-lg">Out of Stock</span>
                  </div>
                )}
              </div>
            </div>

            {/* ── Right: Details ── */}
            <div className="space-y-5">

              {/* Category + badges */}
              <div className="flex flex-wrap items-center gap-2">
                <Badge className="bg-violet-100 text-violet-700 border-violet-200 capitalize font-medium">
                  {getCategoryName(product.category)}
                </Badge>
                {product.inStock
                  ? <Badge className="bg-green-100 text-green-700 border-green-200">In Stock</Badge>
                  : <Badge className="bg-red-100 text-red-700 border-red-200">Out of Stock</Badge>
                }
              </div>

              {/* Name */}
              <h1 className="text-3xl font-extrabold text-gray-900 leading-tight">{product.name}</h1>

              {/* Price */}
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                <div className="text-xs text-gray-400 mb-1 uppercase tracking-wide font-medium">
                  {variantSummary ? `Price for "${variantSummary}"` : 'Base Price'}
                </div>
                <div className="flex items-end gap-3">
                  <span className="text-4xl font-extrabold text-violet-700">
                    PKR {displayPrice.toLocaleString()}
                  </span>
                  {(colorVariants.length > 0 || packageVariants.length > 0) && displayPrice !== product.price && (
                    <span className="text-sm text-gray-400 line-through mb-1">
                      PKR {product.price.toLocaleString()}
                    </span>
                  )}
                </div>
              </div>

              {/* Color variants */}
              {colorVariants.length > 0 && (
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="font-semibold text-gray-800 text-sm">Select Color</Label>
                    {selectedColor && (
                      <span className="text-sm font-medium text-violet-600 bg-violet-50 px-2 py-0.5 rounded-full">
                        {selectedColor.label} — PKR {selectedColor.price.toLocaleString()}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {colorVariants.map(v => (
                      <button
                        key={v.label}
                        title={`${v.label} — PKR ${v.price.toLocaleString()}`}
                        onClick={() => setSelectedColor(v)}
                        className={`relative w-11 h-11 rounded-full transition-all duration-150 ${
                          selectedColor?.label === v.label
                            ? 'ring-2 ring-offset-2 ring-violet-600 scale-110'
                            : 'hover:scale-105 ring-1 ring-gray-200'
                        }`}
                        style={{ backgroundColor: v.color }}
                      >
                        {selectedColor?.label === v.label && (
                          <Check className="w-4 h-4 text-white absolute inset-0 m-auto drop-shadow-md" strokeWidth={3} />
                        )}
                      </button>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {colorVariants.map(v => (
                      <button
                        key={v.label}
                        onClick={() => setSelectedColor(v)}
                        className={`text-xs px-3 py-1 rounded-full border transition-all ${
                          selectedColor?.label === v.label
                            ? 'bg-violet-600 text-white border-violet-600'
                            : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-violet-300'
                        }`}
                      >
                        {v.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Package variants */}
              {packageVariants.length > 0 && (
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 space-y-3">
                  <Label className="font-semibold text-gray-800 text-sm block">Select Package</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {packageVariants.map(v => (
                      <button
                        key={v.label}
                        onClick={() => setSelectedPackage(v)}
                        className={`relative text-left p-3 rounded-xl border-2 transition-all ${
                          selectedPackage?.label === v.label
                            ? 'border-orange-500 bg-orange-50'
                            : 'border-gray-200 bg-gray-50 hover:border-orange-300 hover:bg-orange-50/50'
                        }`}
                      >
                        {selectedPackage?.label === v.label && (
                          <Check className="w-4 h-4 text-orange-500 absolute top-2.5 right-2.5" strokeWidth={3} />
                        )}
                        <div className="font-semibold text-gray-800 text-sm pr-6">{v.label}</div>
                        <div className="text-orange-600 font-bold text-sm mt-0.5">PKR {v.price.toLocaleString()}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <Separator />

              {/* Quantity */}
              <div className="flex items-center gap-4">
                <Label className="font-semibold text-gray-800 shrink-0">Quantity</Label>
                <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl p-1 shadow-sm">
                  <button
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-40"
                    disabled={quantity <= 1}
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-8 text-center font-bold text-gray-900">{quantity}</span>
                  <button
                    onClick={() => setQuantity(q => q + 1)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Total preview */}
              <div className="flex items-center justify-between px-4 py-3 bg-violet-50 rounded-xl border border-violet-100">
                <span className="text-sm text-gray-600">Total</span>
                <span className="font-bold text-violet-700 text-lg">
                  PKR {(displayPrice * quantity).toLocaleString()}
                </span>
              </div>

              {/* Add to cart */}
              <div className="flex gap-3">
                <Button
                  onClick={handleAddToCart}
                  disabled={!product.inStock}
                  className="flex-1 h-12 bg-violet-600 hover:bg-violet-700 text-white font-semibold text-base gap-2 shadow-md shadow-violet-200"
                >
                  <ShoppingCart className="w-5 h-5" />
                  {product.inStock ? 'Add to Cart' : 'Out of Stock'}
                </Button>
                <Link href="/cart">
                  <Button variant="outline" className="h-12 px-5 border-2 border-violet-200 text-violet-700 hover:bg-violet-50">
                    View Cart
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* ── Description ── */}
          <div className="mt-14 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-8 py-5 border-b border-gray-100 bg-gray-50">
              <h2 className="text-xl font-bold text-gray-900">Product Description</h2>
            </div>
            <div className="px-8 py-7">
              {product.description ? (
                <div className="prose prose-gray max-w-none">
                  {product.description.split('\n').map((para, i) => (
                    para.trim()
                      ? <p key={i} className="text-gray-600 leading-relaxed mb-4 last:mb-0">{para}</p>
                      : <br key={i} />
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 italic">No description available.</p>
              )}
            </div>
          </div>

          {/* Back link */}
          <div className="mt-8 flex justify-center">
            <Link href="/products">
              <Button variant="outline" className="gap-2 text-gray-600">
                <ArrowLeft className="w-4 h-4" /> Back to All Products
              </Button>
            </Link>
          </div>

        </div>
      </div>
    </MainLayout>
  )
}

function Label({ className = '', children, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className={`text-sm font-medium text-gray-700 ${className}`} {...props}>{children}</label>
}
