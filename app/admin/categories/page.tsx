'use client'

import { useEffect, useState } from 'react'
import { getCategories, addCategory, updateCategory, deleteCategory } from '@/lib/firestore'
import { Category } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import ImageUpload from '@/components/ui/ImageUpload'
import CloudImg from '@/components/ui/CloudImg'
import { Plus, Pencil, Trash2, Tag, ImageIcon } from 'lucide-react'
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

const defaultForm = { name: '', slug: '', imageUrl: '', urlInput: '', color: COLORS[0].value }

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editCategory, setEditCategory] = useState<Category | null>(null)
  const [form, setForm] = useState(defaultForm)
  const [saving, setSaving] = useState(false)

  const load = async () => {
    try { setCategories(await getCategories()) } catch {}
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  const openAdd = () => {
    setEditCategory(null)
    setForm(defaultForm)
    setDialogOpen(true)
  }

  const openEdit = (cat: Category) => {
    setEditCategory(cat)
    setForm({ name: cat.name, slug: cat.slug, imageUrl: cat.imageUrl, urlInput: cat.imageUrl, color: cat.color || COLORS[0].value })
    setDialogOpen(true)
  }

  // Whichever was set last — upload or URL input
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
    if (!confirm('Delete this category? Products using this category will not be affected.')) return
    try { await deleteCategory(id); toast.success('Deleted.'); load() }
    catch { toast.error('Failed to delete.') }
  }

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-violet-300 border-t-violet-600 rounded-full animate-spin" /></div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
          <p className="text-gray-500 text-sm">{categories.length} categor{categories.length !== 1 ? 'ies' : 'y'} — shown as circles on the home page</p>
        </div>
        <Button onClick={openAdd} className="bg-violet-600 hover:bg-violet-700 text-white gap-2">
          <Plus className="w-4 h-4" /> Add Category
        </Button>
      </div>

      {/* Category grid */}
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
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
          {categories.map(cat => (
            <div key={cat.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all text-center group">
              {/* Circle preview */}
              <div className={`w-20 h-20 rounded-full mx-auto mb-3 overflow-hidden bg-gradient-to-br ${cat.color || COLORS[0].value} flex items-center justify-center shadow-lg`}>
                {cat.imageUrl ? (
                  <CloudImg src={cat.imageUrl} alt={cat.name} className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon className="w-8 h-8 text-white/70" />
                )}
              </div>
              <div className="font-semibold text-gray-900 text-sm mb-0.5 truncate">{cat.name}</div>
              <div className="text-gray-400 text-xs mb-3 truncate">/{cat.slug}</div>
              <div className="flex gap-1.5 justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => openEdit(cat)} className="p-1.5 rounded-lg bg-violet-100 text-violet-600 hover:bg-violet-200 transition-colors">
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => handleDelete(cat.id)} className="p-1.5 rounded-lg bg-red-100 text-red-500 hover:bg-red-200 transition-colors">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={o => !o && setDialogOpen(false)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editCategory ? 'Edit Category' : 'Add New Category'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-5 mt-2 max-h-[80vh] overflow-y-auto pr-1">

            {/* Name */}
            <div className="space-y-1.5">
              <Label>Category Name *</Label>
              <Input
                placeholder="e.g. Photo Frames"
                required
                value={form.name}
                onChange={e => setForm(p => ({
                  ...p,
                  name: e.target.value,
                  slug: toSlug(e.target.value),
                }))}
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
              <p className="text-xs text-gray-400">Used to filter products. Auto-generated from name.</p>
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
              <p className="text-xs text-gray-400">Used as fallback when no image, and as circle border glow.</p>
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
              {/* URL preview */}
              {form.urlInput && (
                <div className="w-full h-28 rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={form.urlInput} alt="Preview" className="w-full h-full object-cover" onError={e => (e.currentTarget.style.display = 'none')} />
                </div>
              )}
            </div>

            {/* Preview circle */}
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
                    <div className="text-gray-400 text-xs mt-0.5">This is how it will look on the home page</div>
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
    </div>
  )
}
