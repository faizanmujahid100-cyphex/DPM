'use client'

import { useEffect, useState, useMemo } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import CloudImg from '@/components/ui/CloudImg'
import { useCart } from '@/contexts/CartContext'
import { getProducts, getCategories } from '@/lib/firestore'
import { Product, Category } from '@/types'
import { ShoppingCart, Package, ChevronRight, Zap } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'

export default function ProductsClient() {
  const { addItem } = useCart()
  const router = useRouter()
  const searchParams = useSearchParams()
  const urlCategory = searchParams.get('category') ?? 'all'

  const [products,   setProducts]   = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading,    setLoading]    = useState(true)

  // activeCategory is always a top-level slug (or 'all')
  // activeSubCategory is a sub-level slug (or null)
  const [activeCategory,    setActiveCategory]    = useState('all')
  const [activeSubCategory, setActiveSubCategory] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([
      getProducts().then(p => p.filter(x => x.inStock)),
      getCategories(),
    ])
      .then(([p, c]) => { setProducts(p); setCategories(c) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  // Once categories are loaded, resolve the URL param into top-level + optional sub
  useEffect(() => {
    if (categories.length === 0) return
    if (urlCategory === 'all') { setActiveCategory('all'); setActiveSubCategory(null); return }

    const cat = categories.find(c => c.slug === urlCategory)
    if (!cat) { setActiveCategory('all'); setActiveSubCategory(null); return }

    if (!cat.parentId) {
      // It's a top-level category
      setActiveCategory(cat.slug)
      setActiveSubCategory(null)
    } else {
      // It's a sub-category — find its parent
      const parent = categories.find(c => c.id === cat.parentId)
      setActiveCategory(parent?.slug ?? 'all')
      setActiveSubCategory(cat.slug)
    }
  }, [urlCategory, categories])

  const topLevel    = useMemo(() => categories.filter(c => !c.parentId), [categories])
  const getChildren = (id: string) => categories.filter(c => c.parentId === id)

  const activeCatObj  = categories.find(c => c.slug === activeCategory) ?? null
  const subCats       = activeCatObj ? getChildren(activeCatObj.id) : []

  // All slugs in the active top-level tree
  const treeSlugSet = useMemo(() => {
    if (!activeCatObj) return new Set<string>()
    const children = getChildren(activeCatObj.id)
    return new Set([activeCatObj.slug, ...children.map(c => c.slug)])
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCatObj, categories])

  const filtered = useMemo(() => {
    if (activeCategory === 'all') return products

    if (activeSubCategory) {
      // Filter by exact sub-category (primary or secondary)
      const matched    = products.filter(p => p.category === activeSubCategory || p.secondaryCategory === activeSubCategory)
      const primary    = matched.filter(p => p.category === activeSubCategory)
      const secondary  = matched.filter(p => p.category !== activeSubCategory)
      return [...primary, ...secondary]
    }

    // Filter by entire top-level tree (parent + all sub-categories)
    const inTree     = products.filter(p => treeSlugSet.has(p.category) || (p.secondaryCategory && treeSlugSet.has(p.secondaryCategory)))
    const primary    = inTree.filter(p => p.category === activeCategory)
    const subPrimary = inTree.filter(p => p.category !== activeCategory && treeSlugSet.has(p.category))
    const secondary  = inTree.filter(p => !treeSlugSet.has(p.category))
    return [...primary, ...subPrimary, ...secondary]
  }, [products, activeCategory, activeSubCategory, treeSlugSet])

  const getCategoryColor = (slug: string) =>
    categories.find(c => c.slug === slug)?.color ?? 'from-violet-400 to-purple-500'

  const getCategoryName = (slug: string) =>
    categories.find(c => c.slug === slug)?.name ?? slug.replace(/-/g, ' ')

  const handleAddToCart = (product: Product, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    addItem({ productId: product.id, productName: product.name, price: product.price, quantity: 1, imageUrl: product.imageUrl, category: product.category })
    toast.success(`${product.name} added to cart!`)
  }

  const handleBuyNow = (product: Product, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    addItem({ productId: product.id, productName: product.name, price: product.price, quantity: 1, imageUrl: product.imageUrl, category: product.category })
    router.push('/cart')
  }

  const selectTopLevel = (slug: string) => {
    setActiveCategory(slug)
    setActiveSubCategory(null)
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
              {/* ── Top-level category filter ── */}
              {topLevel.length > 0 && (
                <div className="mb-4">
                  <div className="flex flex-wrap gap-2 justify-center">
                    <button
                      onClick={() => selectTopLevel('all')}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${activeCategory === 'all' ? 'bg-violet-600 text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200 hover:border-violet-300 hover:text-violet-600'}`}
                    >
                      All Products
                    </button>
                    {topLevel.map(cat => (
                      <button
                        key={cat.id}
                        onClick={() => selectTopLevel(cat.slug)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${activeCategory === cat.slug ? 'bg-violet-600 text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200 hover:border-violet-300 hover:text-violet-600'}`}
                      >
                        {cat.imageUrl && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={cat.imageUrl} alt={cat.name} className="w-5 h-5 rounded-full object-cover" />
                        )}
                        {cat.name}
                        {getChildren(cat.id).length > 0 && (
                          <ChevronRight className={`w-3.5 h-3.5 transition-transform ${activeCategory === cat.slug ? 'rotate-90' : ''}`} />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Sub-category chips ── */}
              {subCats.length > 0 && activeCategory !== 'all' && (
                <div className="flex flex-wrap gap-2 justify-center mb-6 pb-4 border-b border-gray-200">
                  <button
                    onClick={() => setActiveSubCategory(null)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${activeSubCategory === null ? 'bg-violet-100 text-violet-700 border-2 border-violet-400' : 'bg-white text-gray-500 border border-gray-200 hover:border-violet-300 hover:text-violet-600'}`}
                  >
                    All {getCategoryName(activeCategory)}
                  </button>
                  {subCats.map(sub => (
                    <button
                      key={sub.id}
                      onClick={() => setActiveSubCategory(sub.slug)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${activeSubCategory === sub.slug ? 'bg-violet-100 text-violet-700 border-2 border-violet-400' : 'bg-white text-gray-500 border border-gray-200 hover:border-violet-300 hover:text-violet-600'}`}
                    >
                      {sub.imageUrl && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={sub.imageUrl} alt={sub.name} className="w-4 h-4 rounded-full object-cover" />
                      )}
                      {sub.name}
                    </button>
                  ))}
                </div>
              )}

              {/* ── Active filter breadcrumb ── */}
              {activeCategory !== 'all' && (
                <div className="flex items-center gap-1.5 text-sm text-gray-400 mb-5 justify-center">
                  <span
                    className="hover:text-violet-600 cursor-pointer font-medium"
                    onClick={() => selectTopLevel('all')}
                  >
                    All Products
                  </span>
                  <ChevronRight className="w-3.5 h-3.5" />
                  <span
                    className={`font-medium ${activeSubCategory ? 'hover:text-violet-600 cursor-pointer' : 'text-violet-700'}`}
                    onClick={() => activeSubCategory && setActiveSubCategory(null)}
                  >
                    {getCategoryName(activeCategory)}
                  </span>
                  {activeSubCategory && (
                    <>
                      <ChevronRight className="w-3.5 h-3.5" />
                      <span className="text-violet-700 font-medium">{getCategoryName(activeSubCategory)}</span>
                    </>
                  )}
                  <span className="ml-1 text-gray-300">({filtered.length})</span>
                </div>
              )}

              {/* ── Products grid ── */}
              {filtered.length === 0 ? (
                <div className="text-center py-16 text-gray-400">
                  <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p className="font-medium">No products in this category yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filtered.map(product => (
                    <Link key={product.id} href={`/products/${product.id}`}
                      className="group bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col cursor-pointer">
                      <div className={`relative aspect-[4/3] bg-gradient-to-br ${getCategoryColor(product.category)} flex items-center justify-center`}>
                        <CloudImg src={product.imageUrl} alt={product.name} className="w-full h-full object-contain" fallback={<Package className="w-16 h-16 text-white/50" />} />
                        {product.featured && <Badge className="absolute top-3 left-3 bg-orange-500 text-white border-0 shadow-md">Featured</Badge>}
                      </div>
                      <div className="p-5 flex flex-col flex-1">
                        <div className="text-xs text-violet-600 font-medium mb-1 capitalize">{getCategoryName(product.category)}</div>
                        <h3 className="font-bold text-gray-900 mb-1 group-hover:text-violet-700 transition-colors">{product.name}</h3>
                        <p className="text-gray-500 text-sm leading-relaxed mb-4 flex-1 line-clamp-2">{product.description}</p>
                        <div className="pt-3 border-t border-gray-100 space-y-2.5">
                          <div>
                            <div className="text-xs text-gray-400">{product.variants?.length ? 'From' : 'Price'}</div>
                            <div className="text-violet-700 font-bold text-lg">PKR {product.price.toLocaleString()}</div>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" onClick={e => handleAddToCart(product, e)} className="flex-1 bg-violet-600 hover:bg-violet-700 text-white gap-1.5">
                              <ShoppingCart className="w-3.5 h-3.5" /> Add
                            </Button>
                            <Button size="sm" onClick={e => handleBuyNow(product, e)} className="flex-1 bg-orange-500 hover:bg-orange-600 text-white gap-1.5">
                              <Zap className="w-3.5 h-3.5" /> Buy Now
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Link>
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
