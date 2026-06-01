'use client'

import { useEffect, useState } from 'react'
import { getProducts, addProduct, updateProduct, deleteProduct } from '@/lib/firestore'
import { Product, ProductCategory } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Plus, Pencil, Trash2, Package } from 'lucide-react'
import { toast } from 'sonner'

const categories: ProductCategory[] = ['photo-frame', 'mug', 'shirt', 'banner', 'business-card', 'sticker', 'custom']
const defaultForm = { name: '', category: 'custom' as ProductCategory, price: '', description: '', imageUrl: '', inStock: true, featured: false }

function ProductForm({ form, setForm, onSubmit, onCancel, loading }: {
  form: typeof defaultForm
  setForm: React.Dispatch<React.SetStateAction<typeof defaultForm>>
  onSubmit: (e: React.FormEvent) => Promise<void>
  onCancel: () => void
  loading: boolean
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Product Name *</Label>
          <Input placeholder="e.g. Custom Mug Print" required value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
        </div>
        <div className="space-y-1.5">
          <Label>Category *</Label>
          <Select value={form.category} onValueChange={(v) => { if (typeof v === 'string') setForm(p => ({ ...p, category: v as ProductCategory })) }}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {categories.map(c => <SelectItem key={c} value={c} className="capitalize">{c.replace('-', ' ')}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Price (PKR) *</Label>
          <Input type="number" placeholder="350" required value={form.price} onChange={e => setForm(p => ({ ...p, price: e.target.value }))} />
        </div>
        <div className="space-y-1.5">
          <Label>Image URL</Label>
          <Input placeholder="https://..." value={form.imageUrl} onChange={e => setForm(p => ({ ...p, imageUrl: e.target.value }))} />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label>Description *</Label>
        <Textarea placeholder="Describe the product..." rows={3} required value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
      </div>
      <div className="flex gap-6">
        <div className="flex items-center gap-2">
          <Switch checked={form.inStock} onCheckedChange={v => setForm(p => ({ ...p, inStock: v }))} />
          <Label>In Stock</Label>
        </div>
        <div className="flex items-center gap-2">
          <Switch checked={form.featured} onCheckedChange={v => setForm(p => ({ ...p, featured: v }))} />
          <Label>Featured</Label>
        </div>
      </div>
      <div className="flex gap-2">
        <Button type="submit" disabled={loading} className="flex-1 bg-violet-600 hover:bg-violet-700 text-white">
          {loading ? 'Saving...' : 'Save Product'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
      </div>
    </form>
  )
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [addOpen, setAddOpen] = useState(false)
  const [editProduct, setEditProduct] = useState<Product | null>(null)
  const [addForm, setAddForm] = useState(defaultForm)
  const [editForm, setEditForm] = useState(defaultForm)
  const [saving, setSaving] = useState(false)

  const load = async () => {
    try { setProducts(await getProducts()) } catch {}
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await addProduct({ name: addForm.name, category: addForm.category, price: Number(addForm.price), description: addForm.description, imageUrl: addForm.imageUrl, inStock: addForm.inStock, featured: addForm.featured })
      toast.success('Product added!')
      setAddOpen(false)
      setAddForm(defaultForm)
      load()
    } catch { toast.error('Failed to add product.') }
    setSaving(false)
  }

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editProduct) return
    setSaving(true)
    try {
      await updateProduct(editProduct.id, { name: editForm.name, category: editForm.category, price: Number(editForm.price), description: editForm.description, imageUrl: editForm.imageUrl, inStock: editForm.inStock, featured: editForm.featured })
      toast.success('Product updated!')
      setEditProduct(null)
      load()
    } catch { toast.error('Failed to update.') }
    setSaving(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this product?')) return
    try { await deleteProduct(id); toast.success('Deleted.'); load() }
    catch { toast.error('Failed to delete.') }
  }

  const openEdit = (product: Product) => {
    setEditProduct(product)
    setEditForm({ name: product.name, category: product.category, price: String(product.price), description: product.description, imageUrl: product.imageUrl, inStock: product.inStock, featured: product.featured })
  }

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-violet-300 border-t-violet-600 rounded-full animate-spin" /></div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Products</h1>
        <Button onClick={() => { setAddForm(defaultForm); setAddOpen(true) }} className="bg-violet-600 hover:bg-violet-700 text-white gap-2">
          <Plus className="w-4 h-4" /> Add Product
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map(product => (
          <div key={product.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center shrink-0">
                <Package className="w-5 h-5 text-violet-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-gray-900 truncate">{product.name}</div>
                <div className="text-xs text-gray-400 capitalize">{product.category.replace('-', ' ')}</div>
              </div>
            </div>
            <p className="text-gray-500 text-xs leading-relaxed mb-3 line-clamp-2">{product.description}</p>
            <div className="flex items-center justify-between mb-3">
              <div className="text-violet-700 font-bold">PKR {product.price.toLocaleString()}</div>
              <div className="flex gap-1">
                {product.featured && <Badge className="bg-orange-100 text-orange-600 border-orange-200 text-xs">Featured</Badge>}
                <Badge className={product.inStock ? 'bg-green-100 text-green-600 border-green-200 text-xs' : 'bg-red-100 text-red-600 border-red-200 text-xs'}>
                  {product.inStock ? 'In Stock' : 'Out of Stock'}
                </Badge>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="flex-1 gap-1.5" onClick={() => openEdit(product)}>
                <Pencil className="w-3 h-3" /> Edit
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleDelete(product.id)} className="text-red-500 hover:text-red-700 hover:bg-red-50 border-red-200">
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          </div>
        ))}
        {products.length === 0 && (
          <div className="col-span-full bg-white rounded-2xl p-10 text-center text-gray-400 shadow-sm border border-gray-100">
            No products yet. Add your first product!
          </div>
        )}
      </div>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Add New Product</DialogTitle></DialogHeader>
          <ProductForm form={addForm} setForm={setAddForm} onSubmit={handleAdd} onCancel={() => setAddOpen(false)} loading={saving} />
        </DialogContent>
      </Dialog>

      <Dialog open={!!editProduct} onOpenChange={o => !o && setEditProduct(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Edit Product</DialogTitle></DialogHeader>
          <ProductForm form={editForm} setForm={setEditForm} onSubmit={handleEdit} onCancel={() => setEditProduct(null)} loading={saving} />
        </DialogContent>
      </Dialog>
    </div>
  )
}
