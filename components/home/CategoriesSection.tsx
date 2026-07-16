'use client'

import { useEffect, useState } from 'react'
import { getCategories, getProducts } from '@/lib/firestore'
import { Category, Product } from '@/types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useCart } from '@/contexts/CartContext'
import { ImageIcon, ShoppingCart, Package, ChevronRight, X, FolderOpen, Zap } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function CategoriesSection() {
  const { addItem } = useCart()
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [products,   setProducts]   = useState<Product[]>([])
  const [loading,    setLoading]    = useState(true)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([
      getCategories(),
      getProducts().then(p => p.filter(x => x.inStock)),
    ])
      .then(([cats, prods]) => { setCategories(cats); setProducts(prods) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const topLevel    = categories.filter(c => !c.parentId)
  const getChildren = (id: string) => categories.filter(c => c.parentId === id)
  const getCatBySlug = (slug: string) => categories.find(c => c.slug === slug)

  const selectedCat = categories.find(c => c.id === selectedId) ?? null
  const subCats     = selectedId ? getChildren(selectedId) : []

  // All slugs in the selected category tree (parent + all sub-children)
  const treeSlugSet = selectedCat
    ? new Set([selectedCat.slug, ...subCats.map(s => s.slug)])
    : new Set<string>()

  // Products: primary-in-tree first, then secondary-in-tree
  const primaryProds   = products.filter(p => treeSlugSet.has(p.category))
  const secondaryProds = products.filter(p => !treeSlugSet.has(p.category) && p.secondaryCategory && treeSlugSet.has(p.secondaryCategory))
  const catProducts    = [...primaryProds, ...secondaryProds]

  const handleCatClick = (cat: Category) =>
    setSelectedId(prev => prev === cat.id ? null : cat.id)

  const handleAddToCart = (product: Product, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    addItem({
      productId: product.id, productName: product.name,
      price: product.price, quantity: 1,
      imageUrl: product.imageUrl, category: product.category,
    })
    toast.success(`${product.name} added to cart!`)
  }

  const handleBuyNow = (product: Product, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    addItem({
      productId: product.id, productName: product.name,
      price: product.price, quantity: 1,
      imageUrl: product.imageUrl, category: product.category,
    })
    router.push('/cart')
  }

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
          <p className="text-gray-500 max-w-lg mx-auto">
            Click a category to explore sub-categories and products.
          </p>
        </div>

        {/* Top-level category circles */}
        <div className="flex flex-wrap justify-center gap-8 md:gap-12">
          {topLevel.map((cat, i) => {
            const children  = getChildren(cat.id)
            const isActive  = selectedId === cat.id
            return (
              <button
                key={cat.id}
                onClick={() => handleCatClick(cat)}
                className="flex flex-col items-center gap-3 group outline-none"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <div className="relative">
                  <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${cat.color || 'from-violet-500 to-purple-600'} blur-md transition-opacity duration-300 scale-110 ${isActive ? 'opacity-50' : 'opacity-0 group-hover:opacity-40'}`} />
                  <div className={`relative w-28 h-28 md:w-32 md:h-32 rounded-full overflow-hidden bg-gradient-to-br ${cat.color || 'from-violet-500 to-purple-600'} shadow-lg transition-all duration-300 flex items-center justify-center ring-4 ${isActive ? 'ring-violet-500 scale-110 shadow-2xl' : 'ring-white group-hover:shadow-2xl group-hover:scale-110'}`}>
                    {cat.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={cat.imageUrl} alt={cat.name} className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="w-10 h-10 text-white/70" />
                    )}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 rounded-full" />
                  </div>
                </div>
                <div className="text-center">
                  <div className={`font-semibold text-sm md:text-base transition-colors duration-200 leading-tight ${isActive ? 'text-violet-700' : 'text-gray-800 group-hover:text-violet-700'}`}>
                    {cat.name}
                  </div>
                  {children.length > 0 && (
                    <div className="text-xs text-gray-400 mt-0.5">
                      {children.length} sub-categor{children.length !== 1 ? 'ies' : 'y'}
                    </div>
                  )}
                </div>
              </button>
            )
          })}
        </div>

        {/* ── Expanded section ── */}
        {selectedCat && (
          <div className="mt-14 pt-10 border-t border-gray-100 animate-in fade-in slide-in-from-top-2 duration-300">

            {/* Section header */}
            <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${selectedCat.color || 'from-violet-500 to-purple-600'} flex items-center justify-center overflow-hidden shadow`}>
                  {selectedCat.imageUrl
                    ? <img src={selectedCat.imageUrl} alt={selectedCat.name} className="w-full h-full object-cover" />  // eslint-disable-line @next/next/no-img-element
                    : <FolderOpen className="w-5 h-5 text-white/80" />}
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">{selectedCat.name}</h3>
                  <p className="text-gray-400 text-sm">
                    {catProducts.length} product{catProducts.length !== 1 ? 's' : ''}
                    {subCats.length > 0 && ` · ${subCats.length} sub-categor${subCats.length !== 1 ? 'ies' : 'y'}`}
                  </p>
                </div>
              </div>
              <div className="flex gap-2 items-center">
                <Link href={`/products?category=${selectedCat.slug}`}>
                  <Button variant="outline" size="sm" className="gap-1.5 text-violet-600 border-violet-200 hover:bg-violet-50">
                    View All <ChevronRight className="w-3.5 h-3.5" />
                  </Button>
                </Link>
                <button
                  onClick={() => setSelectedId(null)}
                  className="p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                  title="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Sub-categories */}
            {subCats.length > 0 && (
              <div className="mb-8">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Sub-categories</p>
                <div className="flex flex-wrap gap-3">
                  {subCats.map(sub => (
                    <Link key={sub.id} href={`/products?category=${sub.slug}`}>
                      <div className="flex items-center gap-2.5 px-4 py-2.5 bg-gray-50 hover:bg-violet-50 border border-gray-200 hover:border-violet-300 rounded-xl cursor-pointer transition-all group">
                        {sub.imageUrl && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={sub.imageUrl} alt={sub.name} className="w-6 h-6 rounded-full object-cover" />
                        )}
                        <span className="text-sm font-semibold text-gray-700 group-hover:text-violet-700">{sub.name}</span>
                        <ChevronRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-violet-500" />
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Products */}
            {catProducts.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="font-medium text-gray-500">No products in this category yet.</p>
              </div>
            ) : (
              <>
                {/* "Primary" label if mixed */}
                {primaryProds.length > 0 && secondaryProds.length > 0 && (
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Products</p>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                  {catProducts.slice(0, 8).map(product => {
                    const cat = getCatBySlug(product.category)
                    return (
                      <Link key={product.id} href={`/products/${product.id}`}
                        className="group bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col cursor-pointer">
                        <div className={`relative aspect-[4/3] bg-gradient-to-br ${cat?.color ?? 'from-violet-400 to-purple-500'} flex items-center justify-center`}>
                          {product.imageUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={product.imageUrl} alt={product.name} className="w-full h-full object-contain" />
                          ) : (
                            <Package className="w-16 h-16 text-white/50" />
                          )}
                          {product.featured && (
                            <Badge className="absolute top-3 left-3 bg-orange-500 text-white border-0 shadow-md">Featured</Badge>
                          )}
                        </div>
                        <div className="p-4 flex flex-col flex-1">
                          <div className="text-xs text-violet-600 font-medium mb-1 capitalize">
                            {cat?.name ?? product.category}
                          </div>
                          <h3 className="font-bold text-gray-900 mb-1 group-hover:text-violet-700 transition-colors truncate">
                            {product.name}
                          </h3>
                          <p className="text-gray-500 text-sm leading-relaxed mb-3 flex-1 line-clamp-2">
                            {product.description}
                          </p>
                          <div className="pt-3 border-t border-gray-100 space-y-2.5">
                            <div>
                              <div className="text-xs text-gray-400">{product.variants?.length ? 'From' : 'Price'}</div>
                              <div className="text-violet-700 font-bold">PKR {product.price.toLocaleString()}</div>
                            </div>
                            <div className="flex gap-2">
                              <Button size="sm" onClick={e => handleAddToCart(product, e)}
                                className="flex-1 bg-violet-600 hover:bg-violet-700 text-white gap-1.5">
                                <ShoppingCart className="w-3.5 h-3.5" /> Add
                              </Button>
                              <Button size="sm" onClick={e => handleBuyNow(product, e)}
                                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white gap-1.5">
                                <Zap className="w-3.5 h-3.5" /> Buy Now
                              </Button>
                            </div>
                          </div>
                        </div>
                      </Link>
                    )
                  })}
                </div>

                {catProducts.length > 8 && (
                  <div className="text-center mt-8">
                    <Link href={`/products?category=${selectedCat.slug}`}>
                      <Button className="bg-violet-600 hover:bg-violet-700 text-white gap-2">
                        View All {catProducts.length} Products <ChevronRight className="w-4 h-4" />
                      </Button>
                    </Link>
                  </div>
                )}
              </>
            )}
          </div>
        )}

      </div>
    </section>
  )
}
