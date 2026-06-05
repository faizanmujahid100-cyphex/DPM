'use client'

import { useEffect, useState } from 'react'
import { getProducts, addProduct, updateProduct, deleteProduct, getCategories } from '@/lib/firestore'
import { Product, Category, ProductVariant } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import ImageUpload from '@/components/ui/ImageUpload'
import CloudImg from '@/components/ui/CloudImg'
import { Plus, Pencil, Trash2, Package, Tag, Eye, X, Palette, Box, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'

// ── Types ─────────────────────────────────────────────────────────────────────

interface ColorRow { label: string; price: string; color: string }
interface AddonRow { label: string; price: string }

interface FormState {
  name: string; category: string; price: string; description: string
  imageUrl: string; inStock: boolean; featured: boolean
  colors: ColorRow[]
  addons: AddonRow[]
}

const BLANK: FormState = {
  name: '', category: '', price: '', description: '',
  imageUrl: '', inStock: true, featured: false,
  colors: [], addons: [],
}

function toForm(p: Product): FormState {
  return {
    name: p.name, category: p.category, price: String(p.price),
    description: p.description, imageUrl: p.imageUrl,
    inStock: p.inStock, featured: p.featured,
    colors: (p.variants ?? []).filter(v => v.type === 'color')
      .map(v => ({ label: v.label, price: String(v.price), color: v.color ?? '#000000' })),
    addons: (p.variants ?? []).filter(v => v.type === 'package')
      .map(v => ({ label: v.label, price: String(v.price) })),
  }
}

function toVariants(f: FormState): ProductVariant[] {
  return [
    ...f.colors.filter(c => c.label.trim())
      .map(c => ({ label: c.label.trim(), price: Number(c.price) || 0, color: c.color, type: 'color' as const })),
    ...f.addons.filter(a => a.label.trim())
      .map(a => ({ label: a.label.trim(), price: Number(a.price) || 0, type: 'package' as const })),
  ]
}

const SWATCHES = [
  '#000000', '#ffffff', '#6b7280', '#d1d5db',
  '#ef4444', '#f97316', '#eab308', '#22c55e',
  '#14b8a6', '#3b82f6', '#8b5cf6', '#ec4899',
  '#1e3a8a', '#92400e', '#166534', '#7f1d1d',
]

// ── Full-page ProductForm ──────────────────────────────────────────────────────

function ProductForm({ initial, title, categories, onSave, onCancel, saving }: {
  initial: FormState
  title: string
  categories: Category[]
  onSave: (f: FormState) => void
  onCancel: () => void
  saving: boolean
}) {
  const [f, setF] = useState<FormState>(initial)

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setF(p => ({ ...p, [k]: v }))

  const addColor = () => setF(p => ({ ...p, colors: [...p.colors, { label: '', price: '', color: '#3b82f6' }] }))
  const delColor = (i: number) => setF(p => ({ ...p, colors: p.colors.filter((_, j) => j !== i) }))
  const setColor = (i: number, k: keyof ColorRow, v: string) =>
    setF(p => ({ ...p, colors: p.colors.map((c, j) => j === i ? { ...c, [k]: v } : c) }))

  const addAddon = () => setF(p => ({ ...p, addons: [...p.addons, { label: '', price: '' }] }))
  const delAddon = (i: number) => setF(p => ({ ...p, addons: p.addons.filter((_, j) => j !== i) }))
  const setAddon = (i: number, k: keyof AddonRow, v: string) =>
    setF(p => ({ ...p, addons: p.addons.map((a, j) => j === i ? { ...a, [k]: v } : a) }))

  return (
    <form onSubmit={e => { e.preventDefault(); onSave(f) }} className="space-y-6">

      {/* Top bar */}
      <div className="flex items-center justify-between">
        <button type="button" onClick={onCancel}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-violet-600 transition-colors font-medium">
          <ArrowLeft className="w-4 h-4" /> Back to Products
        </button>
        <h2 className="text-xl font-bold text-gray-900">{title}</h2>
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={onCancel} className="h-10 px-5">
            Cancel
          </Button>
          <Button type="submit" disabled={saving || !f.category}
            className="h-10 px-6 bg-violet-600 hover:bg-violet-700 text-white font-semibold">
            {saving ? 'Saving…' : 'Save Product'}
          </Button>
        </div>
      </div>

      {/* ── Row 1: Image + Basic Info ── */}
      <div className="grid grid-cols-1 lg:grid-cols-[320px,1fr] gap-6">

        {/* Image */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 space-y-4">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Product Image</p>
          <ImageUpload value={f.imageUrl} onChange={url => set('imageUrl', url)}
            label="Upload Product Image" folder="dpm/products" />

          <div className="pt-2 border-t border-gray-100 space-y-3">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Visibility</p>
            <label className="flex items-center gap-3 cursor-pointer">
              <Switch checked={f.inStock} onCheckedChange={v => set('inStock', v)} />
              <div>
                <div className="text-sm font-semibold text-gray-800">In Stock</div>
                <div className="text-xs text-gray-400">Visible to customers</div>
              </div>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <Switch checked={f.featured} onCheckedChange={v => set('featured', v)} />
              <div>
                <div className="text-sm font-semibold text-gray-800">Featured</div>
                <div className="text-xs text-gray-400">Show on homepage</div>
              </div>
            </label>
          </div>
        </div>

        {/* Basic fields */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 space-y-4">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Basic Information</p>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="font-semibold">Product Name *</Label>
              <Input required placeholder="e.g. Custom Mug Print" value={f.name}
                onChange={e => set('name', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="font-semibold">Category *</Label>
              {categories.length === 0
                ? <p className="text-xs text-yellow-700 bg-yellow-50 border border-yellow-200 rounded-lg p-2.5">
                    No categories. <Link href="/admin/categories" className="underline font-semibold">Add first →</Link>
                  </p>
                : <Select value={f.category} onValueChange={v => set('category', v ?? '')}>
                    <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                    <SelectContent>
                      {categories.map(c => <SelectItem key={c.id} value={c.slug}>{c.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
              }
            </div>
          </div>

          <div className="space-y-1.5 max-w-xs">
            <Label className="font-semibold">Base Price (PKR) *</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400 font-medium">PKR</span>
              <Input required type="number" min="0" placeholder="200" value={f.price}
                onChange={e => set('price', e.target.value)} className="pl-12" />
            </div>
            <p className="text-xs text-gray-400">Shown when no color or add-on is selected</p>
          </div>

          <div className="space-y-1.5">
            <Label className="font-semibold">Description *</Label>
            <Textarea required placeholder="Describe the product in detail — this appears on the product page." rows={5}
              value={f.description} onChange={e => set('description', e.target.value)} />
          </div>
        </div>
      </div>

      {/* ── Row 2: Color Variants ── */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center">
              <Palette className="w-4 h-4 text-violet-600" />
            </div>
            <div>
              <p className="font-bold text-gray-900">Color Variants</p>
              <p className="text-xs text-gray-400">Each color can add a price on top of the base price</p>
            </div>
            {f.colors.length > 0 && (
              <span className="text-xs font-bold bg-violet-100 text-violet-700 px-2.5 py-1 rounded-full">
                {f.colors.length} color{f.colors.length > 1 ? 's' : ''}
              </span>
            )}
          </div>
          <Button type="button" variant="outline" onClick={addColor}
            className="border-violet-300 text-violet-700 hover:bg-violet-50 gap-2">
            <Plus className="w-4 h-4" /> Add Color
          </Button>
        </div>

        {f.colors.length === 0
          ? <div className="text-center py-10 border-2 border-dashed border-violet-200 rounded-xl">
              <Palette className="w-10 h-10 mx-auto mb-3 text-violet-200" />
              <p className="text-gray-400 font-medium">No color variants yet</p>
              <p className="text-gray-400 text-sm">Click <strong>Add Color</strong> to let customers pick colors with different prices</p>
            </div>
          : <div className="space-y-3">
              {f.colors.map((c, i) => (
                <div key={i} className="bg-violet-50/50 border border-violet-100 rounded-xl p-4 space-y-3">
                  {/* Main row */}
                  <div className="flex items-center gap-3 flex-wrap">
                    <div className="w-10 h-10 rounded-full shrink-0 border-2 border-white shadow"
                      style={{ backgroundColor: c.color }} />
                    <Input placeholder="Color name  (e.g. Black, Navy Blue, Red)" value={c.label}
                      onChange={e => setColor(i, 'label', e.target.value)}
                      className="flex-1 min-w-48 bg-white" />
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-sm text-gray-500 font-medium whitespace-nowrap">Add-on price:</span>
                      <div className="relative w-40">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-violet-600 font-bold">+PKR</span>
                        <Input type="number" min="0" placeholder="0  (0 = same as base)" value={c.price}
                          onChange={e => setColor(i, 'price', e.target.value)}
                          className="pl-14 bg-white" />
                      </div>
                    </div>
                    {f.price && (
                      <div className="shrink-0 bg-violet-600 text-white rounded-lg px-3 py-1.5 text-center min-w-28">
                        <div className="text-[10px] font-medium opacity-80">Customer pays</div>
                        <div className="text-sm font-extrabold">
                          PKR {(Number(f.price) + (Number(c.price) || 0)).toLocaleString()}
                        </div>
                      </div>
                    )}
                    <button type="button" onClick={() => delColor(i)}
                      className="p-2 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors shrink-0">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  {/* Swatches */}
                  <div className="flex flex-wrap items-center gap-2 pl-13">
                    <span className="text-xs text-gray-400 mr-1">Pick color:</span>
                    {SWATCHES.map(hex => (
                      <button key={hex} type="button" title={hex}
                        onClick={() => setColor(i, 'color', hex)}
                        className={`w-7 h-7 rounded-full border-2 transition-all hover:scale-110 ${
                          c.color === hex
                            ? 'ring-2 ring-violet-500 ring-offset-2 scale-110 border-white'
                            : 'border-gray-200 hover:border-gray-400'
                        }`}
                        style={{ backgroundColor: hex }} />
                    ))}
                    <input type="text" value={c.color} maxLength={7} placeholder="#000000"
                      onChange={e => setColor(i, 'color', e.target.value)}
                      className="ml-2 w-24 text-xs font-mono border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-violet-400 bg-white" />
                  </div>
                </div>
              ))}
            </div>
        }
      </div>

      {/* ── Row 3: Add-ons ── */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center">
              <Box className="w-4 h-4 text-orange-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="font-bold text-gray-900">Add-ons</p>
                <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">Optional</span>
              </div>
              <p className="text-xs text-gray-400">Customers can choose any combination or skip entirely</p>
            </div>
            {f.addons.length > 0 && (
              <span className="text-xs font-bold bg-orange-100 text-orange-700 px-2.5 py-1 rounded-full">
                {f.addons.length} option{f.addons.length > 1 ? 's' : ''}
              </span>
            )}
          </div>
          <Button type="button" variant="outline" onClick={addAddon}
            className="border-orange-300 text-orange-700 hover:bg-orange-50 gap-2">
            <Plus className="w-4 h-4" /> Add Option
          </Button>
        </div>

        {f.addons.length === 0
          ? <div className="text-center py-10 border-2 border-dashed border-orange-200 rounded-xl">
              <Box className="w-10 h-10 mx-auto mb-3 text-orange-200" />
              <p className="text-gray-400 font-medium">No add-ons yet</p>
              <p className="text-gray-400 text-sm">E.g. "Gift Box", "Cloth Cover", "Plastic Cover"</p>
            </div>
          : <div className="space-y-3">
              {f.addons.map((a, i) => (
                <div key={i} className="flex items-center gap-3 bg-orange-50/50 border border-orange-100 rounded-xl p-4 flex-wrap">
                  <Input placeholder="Add-on label  (e.g. Gift Box, Cloth Cover)" value={a.label}
                    onChange={e => setAddon(i, 'label', e.target.value)}
                    className="flex-1 min-w-48 bg-white" />
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-sm text-gray-500 font-medium whitespace-nowrap">Add-on price:</span>
                    <div className="relative w-40">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-orange-600 font-bold">+PKR</span>
                      <Input type="number" min="0" placeholder="0  (0 = no extra charge)" value={a.price}
                        onChange={e => setAddon(i, 'price', e.target.value)}
                        className="pl-14 bg-white" />
                    </div>
                  </div>
                  {f.price && (
                    <div className="shrink-0 bg-orange-500 text-white rounded-lg px-3 py-1.5 text-center min-w-28">
                      <div className="text-[10px] font-medium opacity-80">Customer pays</div>
                      <div className="text-sm font-extrabold">
                        PKR {(Number(f.price) + (Number(a.price) || 0)).toLocaleString()}
                      </div>
                    </div>
                  )}
                  <button type="button" onClick={() => delAddon(i)}
                    className="p-2 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors shrink-0">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
        }
      </div>

      {/* Bottom save bar */}
      <div className="flex items-center justify-end gap-3 pb-6">
        <Button type="button" variant="outline" onClick={onCancel} className="h-11 px-6 font-semibold">
          Cancel
        </Button>
        <Button type="submit" disabled={saving || !f.category}
          className="h-11 px-10 bg-violet-600 hover:bg-violet-700 text-white font-bold text-base">
          {saving ? 'Saving…' : 'Save Product'}
        </Button>
      </div>
    </form>
  )
}

// ── Main page ──────────────────────────────────────────────────────────────────

type View = 'list' | 'add' | 'edit'

export default function AdminProductsPage() {
  const [products,    setProducts]    = useState<Product[]>([])
  const [categories,  setCategories]  = useState<Category[]>([])
  const [loading,     setLoading]     = useState(true)
  const [saving,      setSaving]      = useState(false)
  const [view,        setView]        = useState<View>('list')
  const [editProduct, setEditProduct] = useState<Product | null>(null)

  const load = async () => {
    try {
      const [p, c] = await Promise.all([getProducts(), getCategories()])
      setProducts(p); setCategories(c)
    } catch (e) { console.error(e) }
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  const getCategoryName  = (s: string) => categories.find(c => c.slug === s)?.name ?? s
  const getCategoryColor = (s: string) => categories.find(c => c.slug === s)?.color ?? 'from-violet-400 to-purple-500'

  const openAdd  = () => { setEditProduct(null); setView('add') }
  const openEdit = (p: Product) => { setEditProduct(p); setView('edit') }
  const goList   = () => { setView('list'); setEditProduct(null) }

  const handleAdd = async (f: FormState) => {
    setSaving(true)
    const variants = toVariants(f)
    try {
      await addProduct({
        name: f.name, category: f.category, price: Number(f.price),
        description: f.description, imageUrl: f.imageUrl,
        inStock: f.inStock, featured: f.featured, variants,
      })
      toast.success(`Product added — ${variants.filter(v => v.type === 'color').length} color(s) saved.`)
      goList(); await load()
    } catch (err) {
      console.error(err)
      toast.error(`Failed: ${(err as Error)?.message ?? String(err)}`)
    }
    setSaving(false)
  }

  const handleEdit = async (f: FormState) => {
    if (!editProduct) return
    setSaving(true)
    const variants = toVariants(f)
    try {
      await updateProduct(editProduct.id, {
        name: f.name, category: f.category, price: Number(f.price),
        description: f.description, imageUrl: f.imageUrl,
        inStock: f.inStock, featured: f.featured, variants,
      })
      toast.success(`Saved — ${variants.filter(v => v.type === 'color').length} color(s), ${variants.filter(v => v.type === 'package').length} add-on(s).`)
      goList(); await load()
    } catch (err) {
      console.error(err)
      toast.error(`Failed: ${(err as Error)?.message ?? String(err)}`)
    }
    setSaving(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this product?')) return
    try { await deleteProduct(id); toast.success('Deleted.'); await load() }
    catch { toast.error('Delete failed.') }
  }

  // ── Form views ──────────────────────────────────────────────────────────────

  if (view === 'add') return (
    <ProductForm
      key="add"
      initial={BLANK}
      title="Add New Product"
      categories={categories}
      onSave={handleAdd}
      onCancel={goList}
      saving={saving}
    />
  )

  if (view === 'edit' && editProduct) return (
    <ProductForm
      key={editProduct.id}
      initial={toForm(editProduct)}
      title={`Edit: ${editProduct.name}`}
      categories={categories}
      onSave={handleEdit}
      onCancel={goList}
      saving={saving}
    />
  )

  // ── Product list ────────────────────────────────────────────────────────────

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="w-8 h-8 border-2 border-violet-300 border-t-violet-600 rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="space-y-6">

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-500 text-sm">{products.length} product{products.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex gap-2">
          {categories.length === 0 && (
            <Link href="/admin/categories">
              <Button variant="outline" className="gap-2 border-yellow-300 text-yellow-700 hover:bg-yellow-50">
                <Tag className="w-4 h-4" /> Add Categories First
              </Button>
            </Link>
          )}
          <Button onClick={openAdd} className="bg-violet-600 hover:bg-violet-700 text-white gap-2">
            <Plus className="w-4 h-4" /> Add Product
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {products.map(product => {
          const colorV = (product.variants ?? []).filter(v => v.type === 'color')
          const addonV = (product.variants ?? []).filter(v => v.type === 'package')
          return (
            <div key={product.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-lg transition-all flex flex-col">
              <div className={`relative h-44 bg-gradient-to-br ${getCategoryColor(product.category)}`}>
                <CloudImg src={product.imageUrl} alt={product.name} className="w-full h-full object-cover"
                  fallback={<Package className="w-14 h-14 text-white/50 absolute inset-0 m-auto" />} />
                <div className="absolute top-2 right-2 flex flex-col gap-1 items-end">
                  {product.featured && <Badge className="bg-orange-500 text-white border-0 text-xs">Featured</Badge>}
                  <Badge className={`${product.inStock ? 'bg-green-500' : 'bg-red-500'} text-white border-0 text-xs`}>
                    {product.inStock ? 'In Stock' : 'Out'}
                  </Badge>
                </div>
                {colorV.length > 0 && (
                  <div className="absolute bottom-2 left-2 flex gap-1">
                    {colorV.slice(0, 6).map(v => (
                      <div key={v.label} title={v.label}
                        className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
                        style={{ backgroundColor: v.color }} />
                    ))}
                  </div>
                )}
              </div>
              <div className="p-4 flex flex-col flex-1">
                <div className="text-xs text-violet-600 font-medium mb-0.5">{getCategoryName(product.category)}</div>
                <div className="font-bold text-gray-900 mb-1 truncate">{product.name}</div>
                <p className="text-gray-500 text-xs leading-relaxed mb-2 line-clamp-2">{product.description}</p>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {colorV.length > 0 && (
                    <span className="text-xs px-2 py-0.5 bg-violet-100 text-violet-700 rounded-full">
                      {colorV.length} color{colorV.length > 1 ? 's' : ''}
                    </span>
                  )}
                  {addonV.length > 0 && (
                    <span className="text-xs px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full">
                      {addonV.length} add-on{addonV.length > 1 ? 's' : ''}
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-100">
                  <div>
                    <div className="text-xs text-gray-400">{product.variants?.length ? 'From' : 'Price'}</div>
                    <div className="text-violet-700 font-bold">PKR {product.price.toLocaleString()}</div>
                  </div>
                  <div className="flex gap-1.5">
                    <Link href={`/products/${product.id}`} target="_blank">
                      <Button variant="outline" size="sm" className="gap-1 text-blue-600 border-blue-200 hover:bg-blue-50">
                        <Eye className="w-3 h-3" /> View
                      </Button>
                    </Link>
                    <Button variant="outline" size="sm" className="gap-1" onClick={() => openEdit(product)}>
                      <Pencil className="w-3 h-3" /> Edit
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleDelete(product.id)}
                      className="text-red-500 hover:bg-red-50 border-red-200">
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
        {products.length === 0 && (
          <div className="col-span-full bg-white rounded-2xl p-12 text-center shadow-sm border">
            <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-gray-600 font-semibold">No products yet</h3>
            <p className="text-gray-400 text-sm mt-1">Add categories first, then add products.</p>
          </div>
        )}
      </div>
    </div>
  )
}
