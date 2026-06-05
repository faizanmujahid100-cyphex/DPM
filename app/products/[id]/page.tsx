'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { getProductById, getCategories } from '@/lib/firestore'
import { Product, Category, ProductVariant } from '@/types'
import { useCart } from '@/contexts/CartContext'
import MainLayout from '@/components/layout/MainLayout'
import { Button } from '@/components/ui/button'
import {
  ShoppingCart, ArrowLeft, Check, Minus, Plus,
  Package, Star, ChevronRight,
} from 'lucide-react'
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

  const base         = product?.price ?? 0
  const colorAddon   = selectedColor?.price   ?? 0
  const pkgAddon     = selectedPackage?.price  ?? 0
  const unitPrice    = base + colorAddon + pkgAddon
  const totalPrice   = unitPrice * quantity

  const hasAddons    = colorAddon > 0 || pkgAddon > 0

  const variantSummary = [selectedColor?.label, selectedPackage?.label].filter(Boolean).join(' + ')

  const getCategoryName  = (s: string) => categories.find(c => c.slug === s)?.name ?? s.replace(/-/g, ' ')
  const getCategoryColor = (s: string) => categories.find(c => c.slug === s)?.color ?? 'from-violet-400 to-purple-500'

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

  /* ── loading ── */
  if (loading) return (
    <MainLayout>
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-8 h-8 border-2 border-violet-300 border-t-violet-600 rounded-full animate-spin" />
      </div>
    </MainLayout>
  )

  /* ── not found ── */
  if (!product) return (
    <MainLayout>
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-white">
        <Package className="w-14 h-14 text-gray-300" />
        <h2 className="text-xl font-bold text-gray-600">Product not found</h2>
        <Link href="/products">
          <Button variant="outline" className="gap-2"><ArrowLeft className="w-4 h-4" /> Browse Products</Button>
        </Link>
      </div>
    </MainLayout>
  )

  const catColor = getCategoryColor(product.category)

  return (
    <MainLayout>
      <div className="bg-white min-h-screen">

        {/* ── breadcrumb ── */}
        <div className="border-b border-gray-100 bg-gray-50/60">
          <div className="container mx-auto px-4 max-w-6xl py-3">
            <nav className="flex items-center gap-1 text-sm text-gray-400">
              <Link href="/" className="hover:text-violet-600 transition-colors">Home</Link>
              <ChevronRight className="w-3.5 h-3.5" />
              <Link href="/products" className="hover:text-violet-600 transition-colors">Products</Link>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="text-gray-700 font-medium truncate">{product.name}</span>
            </nav>
          </div>
        </div>

        {/* ── main layout ── */}
        <div className="container mx-auto px-4 max-w-6xl py-10">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">

            {/* ══════════════ LEFT — image ══════════════ */}
            <div className="lg:sticky lg:top-20">
              <div className={`relative aspect-square w-full rounded-2xl overflow-hidden bg-gradient-to-br ${catColor} shadow-sm border border-gray-100`}>
                {product.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="w-24 h-24 text-white/30" />
                  </div>
                )}

                {product.featured && (
                  <div className="absolute top-3 left-3 flex items-center gap-1 bg-orange-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow">
                    <Star className="w-3 h-3 fill-white" /> Featured
                  </div>
                )}

                {!product.inStock && (
                  <div className="absolute inset-0 bg-black/55 flex items-center justify-center">
                    <span className="bg-red-500 text-white font-bold text-lg px-6 py-2 rounded-xl">
                      Out of Stock
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* ══════════════ RIGHT — details ══════════════ */}
            <div className="space-y-6">

              {/* category + stock pill */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold uppercase tracking-widest text-violet-600">
                  {getCategoryName(product.category)}
                </span>
                <span className="text-gray-300">•</span>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${product.inStock ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                  {product.inStock ? 'In Stock' : 'Out of Stock'}
                </span>
              </div>

              {/* name */}
              <h1 className="text-3xl font-extrabold text-gray-900 leading-tight tracking-tight">
                {product.name}
              </h1>

              {/* ── price ── */}
              <div>
                <p className="text-4xl font-extrabold text-gray-900">
                  PKR <span className="text-violet-600">{unitPrice.toLocaleString()}</span>
                </p>

                {hasAddons && (
                  <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2 text-sm text-gray-500">
                    <span>Base PKR {base.toLocaleString()}</span>
                    {colorAddon > 0 && (
                      <span className="text-violet-600 font-medium">
                        + {selectedColor?.label} +PKR {colorAddon.toLocaleString()}
                      </span>
                    )}
                    {pkgAddon > 0 && (
                      <span className="text-orange-500 font-medium">
                        + {selectedPackage?.label} +PKR {pkgAddon.toLocaleString()}
                      </span>
                    )}
                  </div>
                )}

                {!hasAddons && (colorVariants.length > 0 || packageVariants.length > 0) && (
                  <p className="text-sm text-gray-400 mt-1">Select options below — price may vary</p>
                )}
              </div>

              <div className="border-t border-gray-100" />

              {/* ── color selector ── */}
              {colorVariants.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-sm font-bold text-gray-800">Color:</span>
                    <span className="text-sm text-gray-700">{selectedColor?.label ?? 'None selected'}</span>
                    {colorAddon > 0 && (
                      <span className="text-xs font-semibold text-violet-600 bg-violet-50 px-2 py-0.5 rounded-full ml-1">
                        +PKR {colorAddon.toLocaleString()}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {colorVariants.map(v => (
                      <button
                        key={v.label}
                        onClick={() => setSelectedColor(v)}
                        title={v.label}
                        className="flex flex-col items-center gap-1.5"
                      >
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-150 ${
                            selectedColor?.label === v.label
                              ? 'ring-[3px] ring-offset-2 ring-violet-500 scale-110'
                              : 'ring-1 ring-gray-300 hover:ring-violet-300 hover:scale-105'
                          }`}
                          style={{ backgroundColor: v.color }}
                        >
                          {selectedColor?.label === v.label && (
                            <Check className="w-4 h-4 text-white drop-shadow" strokeWidth={3} />
                          )}
                        </div>
                        <span className={`text-xs font-medium ${selectedColor?.label === v.label ? 'text-violet-600' : 'text-gray-500'}`}>
                          {v.label}
                        </span>
                        {v.price > 0 && (
                          <span className="text-[10px] text-gray-400">+{v.price}</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* ── package selector ── */}
              {packageVariants.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-sm font-bold text-gray-800">Package:</span>
                    {selectedPackage && (
                      <span className="text-sm text-gray-700">{selectedPackage.label}</span>
                    )}
                    {pkgAddon > 0 && (
                      <span className="text-xs font-semibold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full ml-1">
                        +PKR {pkgAddon.toLocaleString()}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {packageVariants.map(v => (
                      <button
                        key={v.label}
                        onClick={() => setSelectedPackage(v)}
                        className={`px-4 py-2.5 rounded-lg border-2 text-sm font-semibold transition-all duration-150 ${
                          selectedPackage?.label === v.label
                            ? 'border-violet-600 bg-violet-600 text-white shadow-sm'
                            : 'border-gray-200 text-gray-700 bg-white hover:border-violet-400 hover:text-violet-700'
                        }`}
                      >
                        {v.label}
                        {v.price > 0 && (
                          <span className={`block text-xs font-normal mt-0.5 ${selectedPackage?.label === v.label ? 'text-violet-200' : 'text-gray-400'}`}>
                            +PKR {v.price.toLocaleString()}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="border-t border-gray-100" />

              {/* ── quantity ── */}
              <div className="flex items-center gap-4">
                <span className="text-sm font-bold text-gray-800 shrink-0">Quantity:</span>
                <div className="flex items-center border-2 border-gray-200 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                    className="w-10 h-10 flex items-center justify-center text-gray-500 hover:bg-gray-50 disabled:opacity-30 border-r-2 border-gray-200 transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-12 text-center font-bold text-gray-900 text-lg">{quantity}</span>
                  <button
                    onClick={() => setQuantity(q => q + 1)}
                    className="w-10 h-10 flex items-center justify-center text-gray-500 hover:bg-gray-50 border-l-2 border-gray-200 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                {quantity > 1 && (
                  <span className="text-sm text-gray-500">
                    = <span className="font-bold text-gray-900">PKR {totalPrice.toLocaleString()}</span>
                  </span>
                )}
              </div>

              {/* ── CTA ── */}
              <div className="flex flex-col gap-2.5">
                <Button
                  onClick={handleAddToCart}
                  disabled={!product.inStock}
                  className="w-full h-13 text-base font-bold bg-violet-600 hover:bg-violet-700 text-white rounded-xl gap-2.5 shadow-md shadow-violet-100"
                  style={{ height: '52px' }}
                >
                  <ShoppingCart className="w-5 h-5" />
                  {product.inStock ? 'Add to Cart' : 'Out of Stock'}
                </Button>
                <Link href="/cart" className="block">
                  <Button
                    variant="outline"
                    className="w-full h-11 font-semibold border-2 border-gray-200 text-gray-700 hover:border-violet-400 hover:text-violet-600 rounded-xl transition-colors"
                  >
                    View Cart
                  </Button>
                </Link>
              </div>

            </div>
          </div>

          {/* ══════════════ DESCRIPTION ══════════════ */}
          <div className="mt-16 pt-10 border-t border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-5">Description</h2>
            {product.description ? (
              <div className="max-w-2xl space-y-3 text-gray-600 leading-relaxed text-base">
                {product.description.split('\n').map((para, i) =>
                  para.trim()
                    ? <p key={i}>{para}</p>
                    : <div key={i} className="h-1" />
                )}
              </div>
            ) : (
              <p className="text-gray-400 italic">No description provided.</p>
            )}
          </div>

          {/* back link */}
          <div className="mt-10">
            <Link href="/products">
              <Button variant="ghost" size="sm" className="gap-1.5 text-gray-400 hover:text-violet-600 -ml-2">
                <ArrowLeft className="w-4 h-4" /> All Products
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
