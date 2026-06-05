'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { getProductById, getCategories } from '@/lib/firestore'
import { Product, Category, ProductVariant } from '@/types'
import { useCart } from '@/contexts/CartContext'
import MainLayout from '@/components/layout/MainLayout'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ShoppingCart, ArrowLeft, Check, Minus, Plus, Package, Star, Palette, Box, Tag } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>()
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

  // Price = base + selected add-ons
  const base            = product?.price ?? 0
  const colorAddon      = selectedColor?.price   ?? 0
  const packageAddon    = selectedPackage?.price  ?? 0
  const unitPrice       = base + colorAddon + packageAddon
  const totalPrice      = unitPrice * quantity

  const variantSummary  = [selectedColor?.label, selectedPackage?.label].filter(Boolean).join(' + ')

  const getCategoryName  = (slug: string) => categories.find(c => c.slug === slug)?.name ?? slug.replace(/-/g, ' ')
  const getCategoryColor = (slug: string) => categories.find(c => c.slug === slug)?.color ?? 'from-violet-400 to-purple-500'

  const handleAddToCart = () => {
    if (!product) return
    addItem({
      productId: product.id,
      productName: product.name,
      price: unitPrice,
      quantity,
      imageUrl: product.imageUrl,
      category: product.category,
      variantLabel: variantSummary || undefined,
    })
    toast.success('Added to cart!')
  }

  // ── Loading ──────────────────────────────────────────────────────────────────
  if (loading) return (
    <MainLayout>
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-2 border-violet-300 border-t-violet-600 rounded-full animate-spin mx-auto" />
          <p className="text-sm text-gray-400">Loading product…</p>
        </div>
      </div>
    </MainLayout>
  )

  // ── Not found ────────────────────────────────────────────────────────────────
  if (!product) return (
    <MainLayout>
      <div className="min-h-screen flex flex-col items-center justify-center gap-5 bg-gray-50">
        <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center">
          <Package className="w-10 h-10 text-gray-300" />
        </div>
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-700 mb-1">Product not found</h2>
          <p className="text-gray-400 text-sm">This product may have been removed or doesn't exist.</p>
        </div>
        <Link href="/products">
          <Button variant="outline" className="gap-2"><ArrowLeft className="w-4 h-4" /> Browse Products</Button>
        </Link>
      </div>
    </MainLayout>
  )

  const catColor = getCategoryColor(product.category)

  return (
    <MainLayout>
      <div className="bg-gray-50 min-h-screen">

        {/* ── Top bar ── */}
        <div className="bg-white border-b border-gray-100 shadow-sm">
          <div className="container mx-auto px-4 max-w-6xl py-3">
            <nav className="flex items-center gap-1.5 text-sm text-gray-400 flex-wrap">
              <Link href="/" className="hover:text-violet-600 transition-colors">Home</Link>
              <span>/</span>
              <Link href="/products" className="hover:text-violet-600 transition-colors">Products</Link>
              <span>/</span>
              <span className="text-gray-700 font-medium">{product.name}</span>
            </nav>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <div className="grid lg:grid-cols-[480px,1fr] gap-8 items-start">

            {/* ══════════════════════════════ LEFT: Image ══════════════════════ */}
            <div className="lg:sticky lg:top-24 space-y-3">
              {/* Main image */}
              <div className={`relative aspect-square rounded-3xl overflow-hidden bg-gradient-to-br ${catColor} shadow-xl`}>
                {product.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={product.imageUrl} alt={product.name}
                    className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="w-28 h-28 text-white/30" />
                  </div>
                )}

                {/* Featured ribbon */}
                {product.featured && (
                  <div className="absolute top-4 left-0 flex items-center gap-1.5 pl-4 pr-3 py-1.5 bg-orange-500 text-white text-xs font-bold rounded-r-full shadow-lg">
                    <Star className="w-3 h-3 fill-white" /> Featured
                  </div>
                )}

                {/* Out of stock overlay */}
                {!product.inStock && (
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
                    <div className="px-5 py-2.5 bg-red-500 text-white font-bold rounded-2xl text-lg shadow-xl">
                      Out of Stock
                    </div>
                  </div>
                )}
              </div>

              {/* Color preview strip (when colors exist) */}
              {colorVariants.length > 0 && (
                <div className="bg-white rounded-2xl px-4 py-3 shadow-sm border border-gray-100 flex items-center gap-3">
                  <Palette className="w-4 h-4 text-gray-400 shrink-0" />
                  <div className="flex gap-2 flex-wrap">
                    {colorVariants.map(v => (
                      <button key={v.label} onClick={() => setSelectedColor(v)}
                        title={v.label}
                        className={`w-6 h-6 rounded-full border-2 transition-all ${
                          selectedColor?.label === v.label ? 'border-violet-600 scale-110' : 'border-transparent hover:scale-110'
                        }`}
                        style={{ backgroundColor: v.color }}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-gray-400 ml-auto">
                    {selectedColor ? selectedColor.label : 'Pick a color'}
                  </span>
                </div>
              )}
            </div>

            {/* ══════════════════════════════ RIGHT: Info ══════════════════════ */}
            <div className="space-y-4">

              {/* Badges + category */}
              <div className="flex flex-wrap gap-2 items-center">
                <span className="inline-flex items-center gap-1.5 text-xs px-3 py-1 bg-violet-100 text-violet-700 rounded-full font-semibold capitalize">
                  <Tag className="w-3 h-3" />
                  {getCategoryName(product.category)}
                </span>
                {product.inStock
                  ? <span className="text-xs px-3 py-1 bg-green-100 text-green-700 rounded-full font-semibold">In Stock</span>
                  : <span className="text-xs px-3 py-1 bg-red-100 text-red-700 rounded-full font-semibold">Out of Stock</span>
                }
                {product.featured && (
                  <span className="text-xs px-3 py-1 bg-orange-100 text-orange-700 rounded-full font-semibold">Featured</span>
                )}
              </div>

              {/* Product name */}
              <h1 className="text-3xl font-extrabold text-gray-900 leading-tight">{product.name}</h1>

              {/* ── Price breakdown card ── */}
              <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
                <div className="px-5 py-4 space-y-2.5">
                  {/* Base */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Base Price</span>
                    <span className="text-sm font-semibold text-gray-700">PKR {base.toLocaleString()}</span>
                  </div>

                  {/* Color add-on */}
                  {selectedColor && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500 flex items-center gap-2">
                        <span className="w-3.5 h-3.5 rounded-full border border-gray-200 shrink-0"
                          style={{ backgroundColor: selectedColor.color }} />
                        Color: {selectedColor.label}
                      </span>
                      <span className={`text-sm font-semibold ${colorAddon > 0 ? 'text-violet-600' : 'text-gray-400'}`}>
                        {colorAddon > 0 ? `+ PKR ${colorAddon.toLocaleString()}` : 'No extra charge'}
                      </span>
                    </div>
                  )}

                  {/* Package add-on */}
                  {selectedPackage && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500 flex items-center gap-1.5">
                        <Box className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                        Package: {selectedPackage.label}
                      </span>
                      <span className={`text-sm font-semibold ${packageAddon > 0 ? 'text-orange-600' : 'text-gray-400'}`}>
                        {packageAddon > 0 ? `+ PKR ${packageAddon.toLocaleString()}` : 'No extra charge'}
                      </span>
                    </div>
                  )}

                  {/* Divider + total */}
                  <div className="border-t border-gray-100 pt-3 flex items-center justify-between">
                    <span className="font-bold text-gray-800">Price per item</span>
                    <span className="text-3xl font-extrabold text-violet-700">PKR {unitPrice.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* ── Color selector ── */}
              {colorVariants.length > 0 && (
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-gray-800 text-sm flex items-center gap-2">
                      <Palette className="w-4 h-4 text-violet-500" /> Select Color
                    </h3>
                    {selectedColor && (
                      <span className="text-xs text-violet-600 bg-violet-50 px-2.5 py-1 rounded-full font-medium">
                        {selectedColor.label}
                        {colorAddon > 0 ? ` +PKR ${colorAddon}` : ' (base price)'}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-3">
                    {colorVariants.map(v => (
                      <button key={v.label} onClick={() => setSelectedColor(v)}
                        className={`group relative flex flex-col items-center gap-1.5 transition-all`}>
                        <div className={`w-12 h-12 rounded-full transition-all duration-150 ${
                          selectedColor?.label === v.label
                            ? 'ring-[3px] ring-offset-2 ring-violet-600 scale-110'
                            : 'ring-1 ring-gray-200 hover:scale-105 hover:ring-violet-300'
                        }`} style={{ backgroundColor: v.color }}>
                          {selectedColor?.label === v.label && (
                            <Check className="w-5 h-5 text-white absolute inset-0 m-auto drop-shadow" strokeWidth={3} />
                          )}
                        </div>
                        <span className={`text-xs font-medium transition-colors ${
                          selectedColor?.label === v.label ? 'text-violet-700' : 'text-gray-500'
                        }`}>{v.label}</span>
                        <span className="text-[10px] text-gray-400">
                          {v.price > 0 ? `+${v.price}` : 'Base'}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Package selector ── */}
              {packageVariants.length > 0 && (
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 space-y-3">
                  <h3 className="font-bold text-gray-800 text-sm flex items-center gap-2">
                    <Box className="w-4 h-4 text-orange-500" /> Select Package
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {packageVariants.map(v => (
                      <button key={v.label} onClick={() => setSelectedPackage(v)}
                        className={`relative text-left p-4 rounded-xl border-2 transition-all ${
                          selectedPackage?.label === v.label
                            ? 'border-orange-500 bg-orange-50 shadow-sm'
                            : 'border-gray-200 bg-gray-50/50 hover:border-orange-300 hover:bg-orange-50/40'
                        }`}>
                        {selectedPackage?.label === v.label && (
                          <div className="absolute top-3 right-3 w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center">
                            <Check className="w-3 h-3 text-white" strokeWidth={3} />
                          </div>
                        )}
                        <div className="font-semibold text-gray-800 text-sm pr-7 leading-snug">{v.label}</div>
                        <div className="mt-1.5 text-sm font-bold text-orange-600">
                          {v.price > 0 ? `+PKR ${v.price.toLocaleString()}` : 'No extra charge'}
                        </div>
                        <div className="mt-0.5 text-xs text-gray-400">
                          Total: PKR {(base + (selectedColor?.price ?? 0) + v.price).toLocaleString()}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Quantity + CTA ── */}
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 space-y-4">
                {/* Quantity row */}
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-gray-800 text-sm">Quantity</span>
                  <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                    <button
                      onClick={() => setQuantity(q => Math.max(1, q - 1))}
                      disabled={quantity <= 1}
                      className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-30 transition-colors border-r border-gray-200"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-12 text-center font-bold text-gray-900 text-lg">{quantity}</span>
                    <button
                      onClick={() => setQuantity(q => q + 1)}
                      className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors border-l border-gray-200"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Grand total */}
                <div className="flex items-center justify-between px-4 py-3 bg-violet-50 rounded-xl border border-violet-100">
                  <div>
                    <div className="text-xs text-violet-500 font-medium">Grand Total</div>
                    <div className="text-xs text-gray-400">{quantity} × PKR {unitPrice.toLocaleString()}</div>
                  </div>
                  <span className="text-2xl font-extrabold text-violet-700">PKR {totalPrice.toLocaleString()}</span>
                </div>

                {/* Buttons */}
                <div className="flex gap-3">
                  <Button
                    onClick={handleAddToCart}
                    disabled={!product.inStock}
                    className="flex-1 h-12 bg-violet-600 hover:bg-violet-700 text-white font-bold text-base gap-2 shadow-lg shadow-violet-200 rounded-xl"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    {product.inStock ? 'Add to Cart' : 'Out of Stock'}
                  </Button>
                  <Link href="/cart">
                    <Button variant="outline" className="h-12 px-5 border-2 border-violet-200 text-violet-700 hover:bg-violet-50 rounded-xl font-semibold">
                      View Cart
                    </Button>
                  </Link>
                </div>
              </div>

            </div>
          </div>

          {/* ══════════════════════════ DESCRIPTION ════════════════════════════ */}
          <div className="mt-10 bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-8 py-5 bg-gradient-to-r from-violet-50 to-purple-50 border-b border-violet-100 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center">
                <Package className="w-4 h-4 text-violet-600" />
              </div>
              <h2 className="text-lg font-bold text-gray-900">Product Description</h2>
            </div>
            <div className="px-8 py-8">
              {product.description ? (
                <div className="space-y-4 max-w-3xl">
                  {product.description.split('\n').map((para, i) =>
                    para.trim()
                      ? <p key={i} className="text-gray-600 leading-relaxed text-base">{para}</p>
                      : <div key={i} className="h-2" />
                  )}
                </div>
              ) : (
                <p className="text-gray-400 italic">No description available for this product.</p>
              )}
            </div>
          </div>

          {/* Back */}
          <div className="mt-6 flex justify-start">
            <Link href="/products">
              <Button variant="ghost" className="gap-2 text-gray-500 hover:text-violet-600">
                <ArrowLeft className="w-4 h-4" /> Back to Products
              </Button>
            </Link>
          </div>

        </div>
      </div>
    </MainLayout>
  )
}
