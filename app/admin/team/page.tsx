'use client'

import { useEffect, useState } from 'react'
import { getTeamMembers, addTeamMember, updateTeamMember, deleteTeamMember, seedDefaultTeamMembers } from '@/lib/firestore'
import { TeamMember } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import ImageUpload from '@/components/ui/ImageUpload'
import CloudImg from '@/components/ui/CloudImg'
import { Plus, Pencil, Trash2, UserCircle2 } from 'lucide-react'
import { toast } from 'sonner'

const COLORS = [
  { label: 'Violet', value: 'from-violet-500 to-purple-600' },
  { label: 'Orange', value: 'from-orange-500 to-pink-500' },
  { label: 'Green', value: 'from-green-500 to-teal-600' },
  { label: 'Blue', value: 'from-blue-500 to-indigo-600' },
  { label: 'Red', value: 'from-red-500 to-orange-600' },
  { label: 'Cyan', value: 'from-cyan-500 to-blue-600' },
  { label: 'Yellow', value: 'from-yellow-500 to-orange-500' },
  { label: 'Pink', value: 'from-pink-500 to-rose-600' },
]

const initialsFromName = (name: string) =>
  name.trim().split(/\s+/).map(w => w[0]).slice(0, 2).join('').toUpperCase()

const defaultForm = { name: '', role: '', initials: '', color: COLORS[0].value, imageUrl: '', order: '1' }

export default function AdminTeamPage() {
  const [members, setMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editMember, setEditMember] = useState<TeamMember | null>(null)
  const [form, setForm] = useState(defaultForm)
  const [saving, setSaving] = useState(false)

  const load = async () => {
    try {
      await seedDefaultTeamMembers()
      setMembers(await getTeamMembers())
    } catch {}
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  const openAdd = () => {
    setEditMember(null)
    setForm({ ...defaultForm, order: String(members.length + 1) })
    setDialogOpen(true)
  }

  const openEdit = (m: TeamMember) => {
    setEditMember(m)
    setForm({ name: m.name, role: m.role, initials: m.initials, color: m.color, imageUrl: m.imageUrl ?? '', order: String(m.order) })
    setDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim() || !form.role.trim()) { toast.error('Name and role are required.'); return }
    setSaving(true)
    const data = {
      name: form.name.trim(),
      role: form.role.trim(),
      initials: (form.initials.trim() || initialsFromName(form.name)).toUpperCase(),
      color: form.color,
      imageUrl: form.imageUrl,
      order: Number(form.order) || 1,
    }
    try {
      if (editMember) {
        await updateTeamMember(editMember.id, data)
        toast.success('Member updated!')
      } else {
        await addTeamMember(data)
        toast.success('Member added!')
      }
      setDialogOpen(false)
      load()
    } catch { toast.error('Failed to save member.') }
    setSaving(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Remove this team member?')) return
    try { await deleteTeamMember(id); toast.success('Removed.'); load() }
    catch { toast.error('Failed to remove.') }
  }

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-violet-300 border-t-violet-600 rounded-full animate-spin" /></div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Team</h1>
          <p className="text-gray-500 text-sm">{members.length} member{members.length !== 1 ? 's' : ''} — shown on the About page</p>
        </div>
        <Button onClick={openAdd} className="bg-violet-600 hover:bg-violet-700 text-white gap-2">
          <Plus className="w-4 h-4" /> Add Member
        </Button>
      </div>

      {members.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
          <UserCircle2 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-gray-600 font-semibold mb-1">No team members yet</h3>
          <p className="text-gray-400 text-sm mb-4">Add your team to display them on the About page.</p>
          <Button onClick={openAdd} className="bg-violet-600 hover:bg-violet-700 text-white gap-2">
            <Plus className="w-4 h-4" /> Add Member
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
          {members.map(m => (
            <div key={m.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all text-center group">
              <div className={`w-20 h-20 rounded-full mx-auto mb-3 overflow-hidden bg-gradient-to-br ${m.color || COLORS[0].value} flex items-center justify-center shadow-lg text-white text-xl font-bold`}>
                {m.imageUrl ? (
                  <CloudImg src={m.imageUrl} alt={m.name} className="w-full h-full object-cover" />
                ) : (
                  m.initials
                )}
              </div>
              <div className="font-semibold text-gray-900 text-sm mb-0.5 truncate">{m.name}</div>
              <div className="text-gray-400 text-xs mb-3 truncate">{m.role}</div>
              <div className="flex gap-1.5 justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => openEdit(m)} className="p-1.5 rounded-lg bg-violet-100 text-violet-600 hover:bg-violet-200 transition-colors">
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => handleDelete(m.id)} className="p-1.5 rounded-lg bg-red-100 text-red-500 hover:bg-red-200 transition-colors">
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
            <DialogTitle>{editMember ? 'Edit Team Member' : 'Add Team Member'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-5 mt-2 max-h-[80vh] overflow-y-auto pr-1">

            <div className="space-y-1.5">
              <Label>Name *</Label>
              <Input
                placeholder="e.g. Muhammad Ali"
                required
                value={form.name}
                onChange={e => setForm(p => ({ ...p, name: e.target.value, initials: p.initials || initialsFromName(e.target.value) }))}
              />
            </div>

            <div className="space-y-1.5">
              <Label>Role / Title *</Label>
              <Input
                placeholder="e.g. Founder & CEO"
                required
                value={form.role}
                onChange={e => setForm(p => ({ ...p, role: e.target.value }))}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Initials (avatar fallback)</Label>
                <Input
                  placeholder="MA"
                  maxLength={2}
                  value={form.initials}
                  onChange={e => setForm(p => ({ ...p, initials: e.target.value.toUpperCase() }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Display Order</Label>
                <Input
                  type="number"
                  min="1"
                  value={form.order}
                  onChange={e => setForm(p => ({ ...p, order: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Avatar Background Color</Label>
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
              <p className="text-xs text-gray-400">Used behind initials, or as fallback if no photo is uploaded.</p>
            </div>

            <div className="space-y-1.5">
              <Label>Photo (optional)</Label>
              <ImageUpload
                value={form.imageUrl}
                onChange={url => setForm(p => ({ ...p, imageUrl: url }))}
                label="Upload Photo"
                folder="dpm/team"
              />
            </div>

            {/* Preview */}
            <div className="space-y-1.5">
              <Label>Preview</Label>
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                <div className={`w-16 h-16 rounded-full overflow-hidden bg-gradient-to-br ${form.color} flex items-center justify-center shadow-lg shrink-0 text-white text-lg font-bold`}>
                  {form.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={form.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    form.initials || initialsFromName(form.name) || '??'
                  )}
                </div>
                <div>
                  <div className="font-semibold text-gray-900">{form.name || 'Member Name'}</div>
                  <div className="text-gray-400 text-xs mt-0.5">{form.role || 'Role / Title'}</div>
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              <Button type="submit" disabled={saving} className="flex-1 bg-violet-600 hover:bg-violet-700 text-white">
                {saving ? 'Saving...' : editMember ? 'Update Member' : 'Add Member'}
              </Button>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
