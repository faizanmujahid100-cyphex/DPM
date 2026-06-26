'use client'

import { useEffect, useState } from 'react'
import { getCategories, addCategory, updateCategory, deleteCategory, getProducts, batchUpdateProducts } from '@/lib/firestore'
import { Category, Product } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import ImageUpload from '@/components/ui/ImageUpload'
import CloudImg from '@/components/ui/CloudImg'
import { Plus, Pencil, Trash2, Tag, ImageIcon, FolderTree, Package, Check } from 'lucide-react'
import { toast } from 'sonner'

const COLORS = [
  { label: 'Violet', value: 'from-violet-500 to-purple-600' },
  { label: 'Orange', value: 'from-orange-500 to-amber-600' },
  { label: 'Pink', value: 'from-pink-500 to-rose-600' },
  { label: 'Green', value: 'from-green-500 to-teal-600' },
  { label: 'Blue', value: 'from-blue-500 to-indigo-600' },
  { label: 'Red', value: 'from-red-500 to-orange-600' },
  { label: 'Cyan', value: 'from-cyan-500 to-blue-600' },
  { label: 'Yellow', value: 'from-yellow-500 to-orange-500' },
]

const toSlug = (name: string) =>
  name.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')

const defaultForm = { name: '', slug: '', imageUrl: '', urlInput: '', color: COLORS[0].value, parentId: '' }

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [products,   setProducts]   = useState<Product[]>([])
  const [loading,    setLoading]    = useState(true)

  // Add/edit dialog
  const [dialogOpen,    setDialogOpen]    = useState(false)
  const [editCategory,  setEditCategory]  = useState<Category | null>(null)
  const [form,          setForm]          = useState(defaultForm)
  const [saving,        setSaving]        = useState(false)

  // Assign products dialog
  const [assignOpen,     setAssignOpen]     = useState(false)
  const [assignCat,      setAssignCat]      = useState<Category | null>(null)
  const [assignChecked,  setAssignChecked]  = useState<Set<string>>(new Set())
  const [assignSaving,   setAssignSaving]   = useState(false)

  const load = async () => {
    try {
      const [cats, prods] = await Promise.all([getCategories(), getProducts()])
      setCategories(cats)
      setProducts(prods)
    } catch {}
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  // ── Category CRUD ─────────────────────────────────────────────────────────────

  const openAdd = () => {
    setEditCategory(null)
    setForm(defaultForm)
    setDialogOpen(true)
  }

  const openEdit = (cat: Category) => {
    setEditCategory(cat)
    setForm({
      name: cat.name,
      slug: cat.slug,
      imageUrl: cat.imageUrl,
      urlInput: cat.imageUrl,
      color: cat.color || COLORS[0].value,
      parentId: cat.parentId ?? '',
    })
    setDialogOpen(true)
  }

  const resolvedImage = form.imageUrl || form.urlInput

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) { toast.error('Category name is required.'); return }
    setSaving(true)
    const data = {
      name: form.name.trim(),
      slug: form.slug || toSlug(form.name),
      imageUrl: resolvedImage,
      color: form.color,
      parentId: form.parentId || null,
    }
    try {
      if (editCategory) {
        await updateCategory(editCategory.id, data)
        toast.success('Category updated!')
      } else {
        await addCategory(data)
        toast.success('Category added!')
      }
      setDialogOpen(false)
      load()
    } catch { toast.error('Failed to save category.') }
    setSaving(false)
  }

  const handleDelete = async (id: string) => {
    const hasChildren = categories.some(c => c.parentId === id)
    if (hasChildren) {
      toast.error('Delete all sub-categories first.')
      return
    }
    if (!confirm('Delete this category? Products using this category will not be affected.')) return
    try { await deleteCategory(id); toast.success('Deleted.'); load() }
    catch { toast.error('Failed to delete.') }
  }

  // ── Assign Products ───────────────────────────────────────────────────────────

  const openAssign = (cat: Category) => {
    setAssignCat(cat)
    // Pre-check products already assigned to this category (as secondary)
    const checked = new Set<string>()
    products.forEach(p => {
      if (p.secondaryCategory === cat.slug) checked.add(p.id)
    })
    setAssignChecked(checked)
    setAssignOpen(true)
  }

  const toggleProductCheck = (id: string) => {
    setAssignChecked(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const handleAssignSave = async () => {
    if (!assignCat) return
    setAssignSaving(true)
    try {
      const updates: { id: string; data: Partial<Product> }[] = []
      // Only touch products whose primary category ≠ this slug (we never override primary)
      products.filter(p => p.category !== assignCat.slug).forEach(p => {
        const wasChecked = p.secondaryCategory === assignCat.slug
        const isChecked  = assignChecked.has(p.id)
        if (wasChecked && !isChecked) updates.push({ id: p.id, data: { secondaryCategory: '' } })
        if (!wasChecked && isChecked)  updates.push({ id: p.id, data: { secondaryCategory: assignCat.slug } })
      })
      if (updates.length) await batchUpdateProducts(updates)
      toast.success(`Products assigned to "${assignCat.name}"!`)
      setAssignOpen(false)
      load()
    } catch { toast.error('Failed to assign products.') }
    setAssignSaving(false)
  }

  // ── Derived data ──────────────────────────────────────────────────────────────

  const topLevel  = categories.filter(c => !c.parentId)
  const getChildren = (id: string) => categories.filter(c => c.parentId === id)

  const productCountForCat = (slug: string) =>
    products.filter(p => p.category === slug || p.secondaryCategory === slug).length

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="w-8 h-8 border-2 border-violet-300 border-t-violet-600 rounded-full animate-spin" />
    </div>
  )

  // ── Category card ─────────────────────────────────────────────────────────────

  const CategoryCard = ({ cat, isChild = false }: { cat: Category; isChild?: boolean }) => (
    <div className={`bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all text-center group ${isChild ? 'ring-1 ring-violet-100' : ''}`}>
      <div className={`w-16 h-16 rounded-full mx-auto mb-3 overflow-hidden bg-gradient-to-br ${cat.color || COLORS[0].value} flex items-center justify-center shadow-lg`}>
        {cat.imageUrl ? (
          <CloudImg src={cat.imageUrl} alt={cat.name} className="w-full h-full object-cover" />
        ) : (
          <ImageIcon className="w-7 h-7 text-white/70" />
        )}
      </div>
      <div className="font-semibold text-gray-900 text-sm mb-0.5 truncate">{cat.name}</div>
      <div className="text-gray-400 text-xs mb-1 truncate">/{cat.slug}</div>
      {isChild && (
        <div className="text-[10px] text-violet-500 font-medium mb-1">Sub-category</div>
      )}
      <div className="text-[10px] text-gray-400 mb-3">
        {productCountForCat(cat.slug)} product{productCountForCat(cat.slug) !== 1 ? 's' : ''}
      </div>
      <div className="flex gap-1 justify-center opacity-0 group-hover:opacity-100 transition-opacity flex-wrap">
        <button onClick={() => openAssign(cat)}
          className="p-1.5 rounded-lg bg-green-100 text-green-600 hover:bg-green-200 transition-colors" title="Assign Products">
          <Package className="w-3.5 h-3.5" />
        </button>
        <button onClick={() => openEdit(cat)}
          className="p-1.5 rounded-lg bg-violet-100 text-violet-600 hover:bg-violet-200 transition-colors" title="Edit">
          <Pencil className="w-3.5 h-3.5" />
        </button>
        <button onClick={() => handleDelete(cat.id)}
          className="p-1.5 rounded-lg bg-red-100 text-red-500 hover:bg-red-200 transition-colors" title="Delete">
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  )

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
          <p className="text-gray-500 text-sm">
            {topLevel.length} top-level · {categories.length - topLevel.length} sub-categories
          </p>
        </div>
        <Button onClick={openAdd} className="bg-violet-600 hover:bg-violet-700 text-white gap-2">
          <Plus className="w-4 h-4" /> Add Category
        </Button>
      </div>

      {categories.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
          <Tag className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-gray-600 font-semibold mb-1">No categories yet</h3>
          <p className="text-gray-400 text-sm mb-4">Add categories to display on the home page and use in products.</p>
          <Button onClick={openAdd} className="bg-violet-600 hover:bg-violet-700 text-white gap-2">
            <Plus className="w-4 h-4" /> Add Category
          </Button>
        </div>
      ) : (
        <div className="space-y-8">
          {topLevel.map(parent => {
            const children = getChildren(parent.id)
            return (
              <div key={parent.id}>
                {/* Parent row */}
                <div className="flex items-center gap-2 mb-3">
                  <FolderTree className="w-4 h-4 text-violet-400" />
                  <span className="text-sm font-bold text-gray-700">
                    {parent.name}
                    {children.length > 0 && (
                      <span className="ml-2 text-xs font-normal text-gray-400">
                        ({children.length} sub-categor{children.length !== 1 ? 'ies' : 'y'})
                      </span>
                    )}
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
                  <CategoryCard cat={parent} />
                  {children.map(child => (
                    <CategoryCard key={child.id} cat={child} isChild />
                  ))}
                  {/* Quick add sub-category button */}
                  <button
                    onClick={() => {
                      setEditCategory(null)
                      setForm({ ...defaultForm, parentId: parent.id })
                      setDialogOpen(true)
                    }}
                    className="aspect-[1/1.4] min-h-[160px] border-2 border-dashed border-violet-200 rounded-2xl flex flex-col items-center justify-center gap-2 text-violet-400 hover:border-violet-400 hover:text-violet-600 hover:bg-violet-50 transition-all"
                  >
                    <Plus className="w-5 h-5" />
                    <span className="text-xs font-semibold">Add Sub</span>
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ── Add / Edit Dialog ── */}
      <Dialog open={dialogOpen} onOpenChange={o => !o && setDialogOpen(false)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editCategory ? 'Edit Category' : 'Add New Category'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-5 mt-2 max-h-[80vh] overflow-y-auto pr-1">

            {/* Parent Category */}
            <div className="space-y-1.5">
              <Label>Parent Category (optional)</Label>
              <Select
                value={form.parentId || '__none__'}
                onValueChange={v => setForm(p => ({ ...p, parentId: (!v || v === '__none__') ? '' : v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Top-level category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">— Top-level (no parent) —</SelectItem>
                  {topLevel
                    .filter(c => c.id !== editCategory?.id)
                    .map(c => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-400">Leave empty for a top-level category. Select a parent to make this a sub-category.</p>
            </div>

            {/* Name */}
            <div className="space-y-1.5">
              <Label>Category Name *</Label>
              <Input
                placeholder="e.g. Photo Frames"
                required
                value={form.name}
                onChange={e => setForm(p => ({ ...p, name: e.target.value, slug: toSlug(e.target.value) }))}
              />
            </div>

            {/* Slug */}
            <div className="space-y-1.5">
              <Label>Slug (URL key)</Label>
              <Input
                placeholder="photo-frames"
                value={form.slug}
                onChange={e => setForm(p => ({ ...p, slug: toSlug(e.target.value) }))}
              />
              <p className="text-xs text-gray-400">Auto-generated from name.</p>
            </div>

            {/* Color */}
            <div className="space-y-1.5">
              <Label>Circle Background Color</Label>
              <div className="grid grid-cols-4 gap-2">
                {COLORS.map(c => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => setForm(p => ({ ...p, color: c.value }))}
                    className={`h-10 rounded-xl bg-gradient-to-br ${c.value} transition-all ${form.color === c.value ? 'ring-2 ring-offset-2 ring-violet-500 scale-105' : 'opacity-70 hover:opacity-100'}`}
                  />
                ))}
              </div>
            </div>

            {/* Image Upload */}
            <div className="space-y-1.5">
              <Label>Category Image — Upload from device</Label>
              <ImageUpload
                value={form.imageUrl}
                onChange={url => setForm(p => ({ ...p, imageUrl: url, urlInput: '' }))}
                label="Upload Category Image"
                folder="dpm/categories"
              />
            </div>

            {/* OR URL */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-xs text-gray-400 font-medium">OR</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>
              <Label>Paste Image URL</Label>
              <Input
                type="url"
                placeholder="https://example.com/image.jpg"
                value={form.urlInput}
                onChange={e => setForm(p => ({ ...p, urlInput: e.target.value, imageUrl: '' }))}
              />
              {form.urlInput && (
                <div className="w-full h-28 rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={form.urlInput} alt="Preview" className="w-full h-full object-cover" onError={e => (e.currentTarget.style.display = 'none')} />
                </div>
              )}
            </div>

            {/* Preview */}
            {(resolvedImage || form.name) && (
              <div className="space-y-1.5">
                <Label>Preview</Label>
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                  <div className={`w-16 h-16 rounded-full overflow-hidden bg-gradient-to-br ${form.color} flex items-center justify-center shadow-lg shrink-0`}>
                    {resolvedImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={resolvedImage} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="w-7 h-7 text-white/70" />
                    )}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{form.name || 'Category Name'}</div>
                    {form.parentId && (
                      <div className="text-xs text-violet-500 mt-0.5">
                        Sub-category of {categories.find(c => c.id === form.parentId)?.name}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-2 pt-1">
              <Button type="submit" disabled={saving} className="flex-1 bg-violet-600 hover:bg-violet-700 text-white">
                {saving ? 'Saving...' : editCategory ? 'Update Category' : 'Add Category'}
              </Button>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── Assign Products Dialog ── */}
      <Dialog open={assignOpen} onOpenChange={o => !o && setAssignOpen(false)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Assign Products to "{assignCat?.name}"</DialogTitle>
          </DialogHeader>
          <div className="mt-2 space-y-3">
            <p className="text-sm text-gray-500">
              Check products to add them to this category as a <span className="font-semibold text-violet-600">secondary category</span>.
              Products already using this as their primary category are shown below and cannot be changed here.
            </p>

            {/* Primary products (read-only) */}
            {assignCat && products.filter(p => p.category === assignCat.slug).length > 0 && (
              <div className="rounded-xl border border-gray-100 bg-gray-50 p-3">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Primary category products</p>
                <div className="space-y-1.5">
                  {products.filter(p => p.category === assignCat!.slug).map(p => (
                    <div key={p.id} className="flex items-center gap-2 text-sm text-gray-600">
                      <div className="w-4 h-4 rounded bg-violet-200 flex items-center justify-center">
                        <Check className="w-2.5 h-2.5 text-violet-700" />
                      </div>
                      {p.name}
                      <span className="ml-auto text-xs text-gray-400">Primary</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* All other products — checkboxes */}
            <div className="max-h-72 overflow-y-auto space-y-1.5 pr-1">
              {products.filter(p => assignCat && p.category !== assignCat.slug).length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-6">No other products available.</p>
              ) : (
                products
                  .filter(p => assignCat && p.category !== assignCat.slug)
                  .map(p => {
                    const checked = assignChecked.has(p.id)
                    return (
                      <label key={p.id}
                        className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer border-2 transition-all ${checked ? 'border-violet-300 bg-violet-50' : 'border-gray-100 bg-white hover:border-violet-200 hover:bg-violet-50/50'}`}>
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${checked ? 'bg-violet-600 border-violet-600' : 'border-gray-300'}`}>
                          {checked && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                        </div>
                        <input type="checkbox" className="sr-only" checked={checked} onChange={() => toggleProductCheck(p.id)} />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-semibold text-gray-800 truncate">{p.name}</div>
                          <div className="text-xs text-gray-400">Primary: {p.category}</div>
                        </div>
                        {checked && <span className="text-xs text-violet-600 font-medium shrink-0">Will assign</span>}
                      </label>
                    )
                  })
              )}
            </div>

            <div className="flex gap-2 pt-2 border-t border-gray-100">
              <Button onClick={handleAssignSave} disabled={assignSaving} className="flex-1 bg-violet-600 hover:bg-violet-700 text-white">
                {assignSaving ? 'Saving...' : 'Save Assignments'}
              </Button>
              <Button variant="outline" onClick={() => setAssignOpen(false)}>Cancel</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
