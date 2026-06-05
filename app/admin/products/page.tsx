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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import ImageUpload from '@/components/ui/ImageUpload'
import CloudImg from '@/components/ui/CloudImg'
import {
  Plus, Pencil, Trash2, Package, Tag, Eye, X,
  Palette, Box, ImageIcon, Info, Settings2,
} from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'

// ── types ──────────────────────────────────────────────────────────────────────

interface ColorRow { label: string; price: string; color: string }
interface PkgRow   { label: string; price: string }

interface FormState {
  name: string
  category: string
  price: string
  description: string
  imageUrl: string
  inStock: boolean
  featured: boolean
  colorVariants: ColorRow[]
  packageVariants: PkgRow[]
}

const defaultForm: FormState = {
  name: '', category: '', price: '', description: '',
  imageUrl: '', inStock: true, featured: false,
  colorVariants: [], packageVariants: [],
}

function productToForm(p: Product): FormState {
  const colors   = (p.variants ?? []).filter(v => v.type === 'color')
  const packages = (p.variants ?? []).filter(v => v.type === 'package')
  return {
    name: p.name, category: p.category, price: String(p.price),
    description: p.description, imageUrl: p.imageUrl,
    inStock: p.inStock, featured: p.featured,
    colorVariants:   colors.map(v => ({ label: v.label, price: String(v.price), color: v.color ?? '#000000' })),
    packageVariants: packages.map(v => ({ label: v.label, price: String(v.price) })),
  }
}

function SectionHeader({ icon: Icon, title, color = 'text-violet-600' }: {
  icon: React.ElementType; title: string; color?: string
}) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <div className={`w-7 h-7 rounded-lg bg-current/10 flex items-center justify-center ${color}`}>
        <Icon className="w-3.5 h-3.5" />
      </div>
      <span className="font-semibold text-gray-800 text-sm">{title}</span>
    </div>
  )
}

// ── ProductForm ────────────────────────────────────────────────────────────────

function ProductForm({ form, setForm, categories, onSubmit, onCancel, loading }: {
  form: FormState
  setForm: React.Dispatch<React.SetStateAction<FormState>>
  categories: Category[]
  onSubmit: (e: React.FormEvent) => Promise<void>
  onCancel: () => void
  loading: boolean
}) {
  const setField = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm(p => ({ ...p, [k]: v }))

  // Color variants helpers
  const addColor = () =>
    setField('colorVariants', [...form.colorVariants, { label: '', price: '', color: '#6d28d9' }])
  const removeColor = (i: number) =>
    setField('colorVariants', form.colorVariants.filter((_, idx) => idx !== i))
  const updateColor = (i: number, k: keyof ColorRow, v: string) =>
    setField('colorVariants', form.colorVariants.map((row, idx) => idx === i ? { ...row, [k]: v } : row))

  // Package variants helpers
  const addPkg = () =>
    setField('packageVariants', [...form.packageVariants, { label: '', price: '' }])
  const removePkg = (i: number) =>
    setField('packageVariants', form.packageVariants.filter((_, idx) => idx !== i))
  const updatePkg = (i: number, k: keyof PkgRow, v: string) =>
    setField('packageVariants', form.packageVariants.map((row, idx) => idx === i ? { ...row, [k]: v } : row))

  return (
    <form onSubmit={onSubmit} className="space-y-6 overflow-y-auto max-h-[76vh] pr-1">

      {/* ── Image ── */}
      <div className="p-4 bg-gray-50 rounded-2xl">
        <SectionHeader icon={ImageIcon} title="Product Image" />
        <ImageUpload
          value={form.imageUrl}
          onChange={url => setField('imageUrl', url)}
          label="Upload Product Image"
          folder="dpm/products"
        />
      </div>

      {/* ── Basic Info ── */}
      <div className="p-4 bg-gray-50 rounded-2xl space-y-4">
        <SectionHeader icon={Info} title="Basic Information" />
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Product Name *</Label>
            <Input placeholder="e.g. Custom Mug Print" required value={form.name}
              onChange={e => setField('name', e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Category *</Label>
            {categories.length === 0 ? (
              <div className="flex items-center gap-2 p-2.5 bg-yellow-50 border border-yellow-200 rounded-lg text-xs text-yellow-700">
                <Tag className="w-3.5 h-3.5 shrink-0" />
                <span>No categories. <Link href="/admin/categories" className="underline font-medium">Add categories first →</Link></span>
              </div>
            ) : (
              <Select value={form.category} onValueChange={v => setField('category', v ?? '')}>
                <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>
                  {categories.map(c => <SelectItem key={c.id} value={c.slug}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
            Base Price (PKR) *
            <span className="ml-2 font-normal normal-case text-gray-400 text-xs">— used when no variant selected</span>
          </Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400 font-medium">PKR</span>
            <Input type="number" min="0" placeholder="350" required value={form.price}
              onChange={e => setField('price', e.target.value)} className="pl-12" />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Description *</Label>
          <Textarea placeholder="Describe the product in detail..." rows={3} required
            value={form.description} onChange={e => setField('description', e.target.value)} />
        </div>
      </div>

      {/* ── Color Variants ── */}
      <div className="p-4 bg-violet-50/60 rounded-2xl border border-violet-100">
        <div className="flex items-center justify-between mb-3">
          <SectionHeader icon={Palette} title="Color Variants" color="text-violet-600" />
          <Button type="button" size="sm" variant="outline"
            className="border-violet-300 text-violet-700 hover:bg-violet-100 gap-1.5 h-8 text-xs"
            onClick={addColor}>
            <Plus className="w-3.5 h-3.5" /> Add Color
          </Button>
        </div>
        {form.colorVariants.length === 0 ? (
          <div className="text-center py-5 border-2 border-dashed border-violet-200 rounded-xl">
            <Palette className="w-8 h-8 text-violet-300 mx-auto mb-2" />
            <p className="text-sm text-gray-400">No color variants. Customers will see the base price.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {form.colorVariants.map((v, i) => (
              <div key={i} className="flex items-center gap-3 bg-white p-3 rounded-xl border border-violet-100 shadow-sm">
                <div className="relative shrink-0">
                  <input type="color" value={v.color}
                    onChange={e => updateColor(i, 'color', e.target.value)}
                    className="w-10 h-10 rounded-xl cursor-pointer border-2 border-gray-200 p-1"
                    style={{ background: 'none' }}
                  />
                  <div className="absolute inset-1 rounded-lg pointer-events-none"
                    style={{ backgroundColor: v.color }} />
                </div>
                <Input placeholder="Color name  (e.g. Black)" value={v.label}
                  onChange={e => updateColor(i, 'label', e.target.value)} className="flex-1 text-sm" />
                <div className="relative w-32 shrink-0">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">PKR</span>
                  <Input type="number" min="0" placeholder="200" value={v.price}
                    onChange={e => updateColor(i, 'price', e.target.value)} className="pl-11 text-sm" />
                </div>
                <Button type="button" variant="ghost" size="icon"
                  className="shrink-0 text-red-400 hover:text-red-600 hover:bg-red-50 h-8 w-8"
                  onClick={() => removeColor(i)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Package Options ── */}
      <div className="p-4 bg-orange-50/60 rounded-2xl border border-orange-100">
        <div className="flex items-center justify-between mb-3">
          <SectionHeader icon={Box} title="Package Options" color="text-orange-600" />
          <Button type="button" size="sm" variant="outline"
            className="border-orange-300 text-orange-700 hover:bg-orange-100 gap-1.5 h-8 text-xs"
            onClick={addPkg}>
            <Plus className="w-3.5 h-3.5" /> Add Package
          </Button>
        </div>
        {form.packageVariants.length === 0 ? (
          <div className="text-center py-5 border-2 border-dashed border-orange-200 rounded-xl">
            <Box className="w-8 h-8 text-orange-300 mx-auto mb-2" />
            <p className="text-sm text-gray-400">No packages. E.g. "Cup + Spoon", "Pen + Cover".</p>
          </div>
        ) : (
          <div className="space-y-2">
            {form.packageVariants.map((v, i) => (
              <div key={i} className="flex items-center gap-3 bg-white p-3 rounded-xl border border-orange-100 shadow-sm">
                <Input placeholder="Package label (e.g. Cup + Spoon)" value={v.label}
                  onChange={e => updatePkg(i, 'label', e.target.value)} className="flex-1 text-sm" />
                <div className="relative w-36 shrink-0">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">PKR</span>
                  <Input type="number" min="0" placeholder="300" value={v.price}
                    onChange={e => updatePkg(i, 'price', e.target.value)} className="pl-11 text-sm" />
                </div>
                <Button type="button" variant="ghost" size="icon"
                  className="shrink-0 text-red-400 hover:text-red-600 hover:bg-red-50 h-8 w-8"
                  onClick={() => removePkg(i)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Settings ── */}
      <div className="p-4 bg-gray-50 rounded-2xl">
        <SectionHeader icon={Settings2} title="Settings" />
        <div className="flex gap-8">
          <div className="flex items-center gap-3">
            <Switch checked={form.inStock} onCheckedChange={v => setField('inStock', v)} />
            <div>
              <div className="text-sm font-medium text-gray-800">In Stock</div>
              <div className="text-xs text-gray-400">Visible to customers</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Switch checked={form.featured} onCheckedChange={v => setField('featured', v)} />
            <div>
              <div className="text-sm font-medium text-gray-800">Featured</div>
              <div className="text-xs text-gray-400">Shown on homepage</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Actions ── */}
      <div className="flex gap-3 pt-1 pb-2">
        <Button type="submit" disabled={loading || categories.length === 0}
          className="flex-1 bg-violet-600 hover:bg-violet-700 text-white h-11 font-semibold">
          {loading ? 'Saving…' : 'Save Product'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} className="h-11 px-6">
          Cancel
        </Button>
      </div>
    </form>
  )
}

// ── Main page ──────────────────────────────────────────────────────────────────

export default function AdminProductsPage() {
  const [products,   setProducts]   = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading,    setLoading]    = useState(true)
  const [addOpen,    setAddOpen]    = useState(false)
  const [editProduct, setEditProduct] = useState<Product | null>(null)
  const [addForm,  setAddForm]  = useState<FormState>(defaultForm)
  const [editForm, setEditForm] = useState<FormState>(defaultForm)
  const [saving,   setSaving]   = useState(false)

  const load = async () => {
    try {
      const [p, c] = await Promise.all([getProducts(), getCategories()])
      setProducts(p); setCategories(c)
    } catch {}
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  const getCategoryName  = (slug: string) => categories.find(c => c.slug === slug)?.name ?? slug
  const getCategoryColor = (slug: string) => categories.find(c => c.slug === slug)?.color ?? 'from-violet-400 to-purple-500'

  const buildVariants = (form: FormState): ProductVariant[] => [
    ...form.colorVariants
      .filter(v => v.label.trim() && v.price)
      .map(v => ({ label: v.label.trim(), price: Number(v.price), color: v.color, type: 'color' as const })),
    ...form.packageVariants
      .filter(v => v.label.trim() && v.price)
      .map(v => ({ label: v.label.trim(), price: Number(v.price), type: 'package' as const })),
  ]

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true)
    try {
      await addProduct({
        name: addForm.name, category: addForm.category, price: Number(addForm.price),
        description: addForm.description, imageUrl: addForm.imageUrl,
        inStock: addForm.inStock, featured: addForm.featured,
        variants: buildVariants(addForm),
      })
      toast.success('Product added!'); setAddOpen(false); setAddForm(defaultForm); load()
    } catch { toast.error('Failed to add product.') }
    setSaving(false)
  }

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault(); if (!editProduct) return; setSaving(true)
    try {
      await updateProduct(editProduct.id, {
        name: editForm.name, category: editForm.category, price: Number(editForm.price),
        description: editForm.description, imageUrl: editForm.imageUrl,
        inStock: editForm.inStock, featured: editForm.featured,
        variants: buildVariants(editForm),
      })
      toast.success('Product updated!'); setEditProduct(null); load()
    } catch { toast.error('Failed to update.') }
    setSaving(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this product?')) return
    try { await deleteProduct(id); toast.success('Deleted.'); load() } catch { toast.error('Failed.') }
  }

  const openEdit = (product: Product) => {
    setEditProduct(product); setEditForm(productToForm(product))
  }

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="w-8 h-8 border-2 border-violet-300 border-t-violet-600 rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-500 text-sm">{products.length} product{products.length !== 1 ? 's' : ''} in catalogue</p>
        </div>
        <div className="flex gap-2">
          {categories.length === 0 && (
            <Link href="/admin/categories">
              <Button variant="outline" className="gap-2 border-yellow-300 text-yellow-700 hover:bg-yellow-50">
                <Tag className="w-4 h-4" /> Add Categories First
              </Button>
            </Link>
          )}
          <Button onClick={() => { setAddForm(defaultForm); setAddOpen(true) }}
            className="bg-violet-600 hover:bg-violet-700 text-white gap-2">
            <Plus className="w-4 h-4" /> Add Product
          </Button>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {products.map(product => {
          const colorVariants   = (product.variants ?? []).filter(v => v.type === 'color')
          const packageVariants = (product.variants ?? []).filter(v => v.type === 'package')
          const minPrice = product.variants?.length
            ? Math.min(product.price, ...product.variants.map(v => v.price))
            : product.price
          return (
            <div key={product.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-lg transition-all flex flex-col">
              <div className={`relative h-44 bg-gradient-to-br ${getCategoryColor(product.category)}`}>
                <CloudImg src={product.imageUrl} alt={product.name} className="w-full h-full object-cover"
                  fallback={<Package className="w-14 h-14 text-white/50 absolute inset-0 m-auto" />} />
                <div className="absolute top-2 right-2 flex gap-1 flex-col items-end">
                  {product.featured && <Badge className="bg-orange-500 text-white border-0 text-xs shadow">Featured</Badge>}
                  <Badge className={`${product.inStock ? 'bg-green-500' : 'bg-red-500'} text-white border-0 text-xs shadow`}>
                    {product.inStock ? 'In Stock' : 'Out of Stock'}
                  </Badge>
                </div>
                {(colorVariants.length > 0) && (
                  <div className="absolute bottom-2 left-2 flex gap-1">
                    {colorVariants.slice(0, 5).map(v => (
                      <div key={v.label} title={v.label}
                        className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
                        style={{ backgroundColor: v.color }} />
                    ))}
                    {colorVariants.length > 5 && (
                      <div className="w-4 h-4 rounded-full bg-white/80 border-2 border-white shadow-sm flex items-center justify-center text-[8px] font-bold text-gray-600">
                        +{colorVariants.length - 5}
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="p-4 flex flex-col flex-1">
                <div className="text-xs text-violet-600 font-medium mb-0.5">{getCategoryName(product.category)}</div>
                <div className="font-bold text-gray-900 mb-1 truncate">{product.name}</div>
                <p className="text-gray-500 text-xs leading-relaxed mb-2 line-clamp-2">{product.description}</p>
                {(colorVariants.length > 0 || packageVariants.length > 0) && (
                  <div className="flex gap-2 mb-2 flex-wrap">
                    {colorVariants.length > 0 && (
                      <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 bg-violet-100 text-violet-700 rounded-full">
                        <Palette className="w-3 h-3" /> {colorVariants.length} color{colorVariants.length > 1 ? 's' : ''}
                      </span>
                    )}
                    {packageVariants.length > 0 && (
                      <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full">
                        <Box className="w-3 h-3" /> {packageVariants.length} pkg{packageVariants.length > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                )}
                <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-100">
                  <div>
                    <div className="text-xs text-gray-400">{product.variants?.length ? 'From' : 'Price'}</div>
                    <div className="text-violet-700 font-bold">PKR {minPrice.toLocaleString()}</div>
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
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 border-red-200">
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
        {products.length === 0 && (
          <div className="col-span-full bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
            <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-gray-600 font-semibold mb-1">No products yet</h3>
            <p className="text-gray-400 text-sm mb-4">Add categories first, then add your products.</p>
          </div>
        )}
      </div>

      {/* Add dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center">
                <Plus className="w-4 h-4 text-violet-600" />
              </div>
              Add New Product
            </DialogTitle>
          </DialogHeader>
          <ProductForm form={addForm} setForm={setAddForm} categories={categories}
            onSubmit={handleAdd} onCancel={() => setAddOpen(false)} loading={saving} />
        </DialogContent>
      </Dialog>

      {/* Edit dialog */}
      <Dialog open={!!editProduct} onOpenChange={o => !o && setEditProduct(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center">
                <Pencil className="w-4 h-4 text-orange-600" />
              </div>
              Edit Product
            </DialogTitle>
          </DialogHeader>
          <ProductForm form={editForm} setForm={setEditForm} categories={categories}
            onSubmit={handleEdit} onCancel={() => setEditProduct(null)} loading={saving} />
        </DialogContent>
      </Dialog>
    </div>
  )
}
