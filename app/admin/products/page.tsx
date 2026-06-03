'use client'

import { useEffect, useState } from 'react'
import { getProducts, addProduct, updateProduct, deleteProduct, getCategories } from '@/lib/firestore'
import { Product, Category } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import ImageUpload from '@/components/ui/ImageUpload'
import CloudImg from '@/components/ui/CloudImg'
import { Plus, Pencil, Trash2, Package, Tag } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'

const defaultForm = { name: '', category: '', price: '', description: '', imageUrl: '', inStock: true, featured: false }

function ProductForm({ form, setForm, categories, onSubmit, onCancel, loading }: {
  form: typeof defaultForm
  setForm: React.Dispatch<React.SetStateAction<typeof defaultForm>>
  categories: Category[]
  onSubmit: (e: React.FormEvent) => Promise<void>
  onCancel: () => void
  loading: boolean
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
      <div className="space-y-1.5">
        <Label>Product Image</Label>
        <ImageUpload value={form.imageUrl} onChange={url => setForm(p => ({ ...p, imageUrl: url }))} label="Upload Product Image" folder="dpm/products" />
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Product Name *</Label>
          <Input placeholder="e.g. Custom Mug Print" required value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
        </div>
        <div className="space-y-1.5">
          <Label>Category *</Label>
          {categories.length === 0 ? (
            <div className="flex items-center gap-2 p-2.5 bg-yellow-50 border border-yellow-200 rounded-lg text-xs text-yellow-700">
              <Tag className="w-3.5 h-3.5 shrink-0" />
              <span>No categories yet. <Link href="/admin/categories" className="underline font-medium">Add categories first →</Link></span>
            </div>
          ) : (
            <Select value={form.category} onValueChange={v => { if (typeof v === 'string') setForm(p => ({ ...p, category: v })) }}>
              <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
              <SelectContent>
                {categories.map(c => (
                  <SelectItem key={c.id} value={c.slug}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </div>
      <div className="space-y-1.5">
        <Label>Price (PKR) *</Label>
        <Input type="number" placeholder="350" required value={form.price} onChange={e => setForm(p => ({ ...p, price: e.target.value }))} />
      </div>
      <div className="space-y-1.5">
        <Label>Description *</Label>
        <Textarea placeholder="Describe the product..." rows={3} required value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
      </div>
      <div className="flex gap-6">
        <div className="flex items-center gap-2"><Switch checked={form.inStock} onCheckedChange={v => setForm(p => ({ ...p, inStock: v }))} /><Label>In Stock</Label></div>
        <div className="flex items-center gap-2"><Switch checked={form.featured} onCheckedChange={v => setForm(p => ({ ...p, featured: v }))} /><Label>Featured</Label></div>
      </div>
      <div className="flex gap-2">
        <Button type="submit" disabled={loading || categories.length === 0} className="flex-1 bg-violet-600 hover:bg-violet-700 text-white">
          {loading ? 'Saving...' : 'Save Product'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
      </div>
    </form>
  )
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [addOpen, setAddOpen] = useState(false)
  const [editProduct, setEditProduct] = useState<Product | null>(null)
  const [addForm, setAddForm] = useState(defaultForm)
  const [editForm, setEditForm] = useState(defaultForm)
  const [saving, setSaving] = useState(false)

  const load = async () => {
    try {
      const [p, c] = await Promise.all([getProducts(), getCategories()])
      setProducts(p)
      setCategories(c)
    } catch {}
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  const getCategoryName = (slug: string) => categories.find(c => c.slug === slug)?.name ?? slug
  const getCategoryColor = (slug: string) => categories.find(c => c.slug === slug)?.color ?? 'from-violet-400 to-purple-500'

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true)
    try {
      await addProduct({ name: addForm.name, category: addForm.category, price: Number(addForm.price), description: addForm.description, imageUrl: addForm.imageUrl, inStock: addForm.inStock, featured: addForm.featured })
      toast.success('Product added!'); setAddOpen(false); setAddForm(defaultForm); load()
    } catch { toast.error('Failed to add product.') }
    setSaving(false)
  }

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault(); if (!editProduct) return; setSaving(true)
    try {
      await updateProduct(editProduct.id, { name: editForm.name, category: editForm.category, price: Number(editForm.price), description: editForm.description, imageUrl: editForm.imageUrl, inStock: editForm.inStock, featured: editForm.featured })
      toast.success('Product updated!'); setEditProduct(null); load()
    } catch { toast.error('Failed to update.') }
    setSaving(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this product?')) return
    try { await deleteProduct(id); toast.success('Deleted.'); load() } catch { toast.error('Failed.') }
  }

  const openEdit = (product: Product) => {
    setEditProduct(product)
    setEditForm({ name: product.name, category: product.category, price: String(product.price), description: product.description, imageUrl: product.imageUrl, inStock: product.inStock, featured: product.featured })
  }

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-violet-300 border-t-violet-600 rounded-full animate-spin" /></div>

  return (
    <div className="space-y-6">
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
          <Button onClick={() => { setAddForm(defaultForm); setAddOpen(true) }} className="bg-violet-600 hover:bg-violet-700 text-white gap-2">
            <Plus className="w-4 h-4" /> Add Product
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {products.map(product => (
          <div key={product.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-lg transition-all">
            <div className={`relative h-44 bg-gradient-to-br ${getCategoryColor(product.category)} flex items-center justify-center`}>
              <CloudImg src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" fallback={<Package className="w-14 h-14 text-white/50" />} />
              <div className="absolute top-2 right-2 flex gap-1 flex-wrap justify-end">
                {product.featured && <Badge className="bg-orange-500 text-white border-0 text-xs shadow">Featured</Badge>}
                <Badge className={`${product.inStock ? 'bg-green-500' : 'bg-red-500'} text-white border-0 text-xs shadow`}>
                  {product.inStock ? 'In Stock' : 'Out'}
                </Badge>
              </div>
            </div>
            <div className="p-4">
              <div className="text-xs text-violet-600 font-medium mb-0.5">{getCategoryName(product.category)}</div>
              <div className="font-bold text-gray-900 mb-1 truncate">{product.name}</div>
              <p className="text-gray-500 text-xs leading-relaxed mb-3 line-clamp-2">{product.description}</p>
              <div className="flex items-center justify-between">
                <div className="text-violet-700 font-bold">PKR {product.price.toLocaleString()}</div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="gap-1" onClick={() => openEdit(product)}><Pencil className="w-3 h-3" /> Edit</Button>
                  <Button variant="outline" size="sm" onClick={() => handleDelete(product.id)} className="text-red-500 hover:text-red-700 hover:bg-red-50 border-red-200"><Trash2 className="w-3 h-3" /></Button>
                </div>
              </div>
            </div>
          </div>
        ))}
        {products.length === 0 && (
          <div className="col-span-full bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
            <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-gray-600 font-semibold mb-1">No products yet</h3>
            <p className="text-gray-400 text-sm mb-4">Add categories first, then add products.</p>
          </div>
        )}
      </div>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Add New Product</DialogTitle></DialogHeader>
          <ProductForm form={addForm} setForm={setAddForm} categories={categories} onSubmit={handleAdd} onCancel={() => setAddOpen(false)} loading={saving} />
        </DialogContent>
      </Dialog>

      <Dialog open={!!editProduct} onOpenChange={o => !o && setEditProduct(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Edit Product</DialogTitle></DialogHeader>
          <ProductForm form={editForm} setForm={setEditForm} categories={categories} onSubmit={handleEdit} onCancel={() => setEditProduct(null)} loading={saving} />
        </DialogContent>
      </Dialog>
    </div>
  )
}
