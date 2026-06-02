'use client'

import { useEffect, useState } from 'react'
import { getAllServices, addService, updateService, deleteService, getAllServiceRequests, updateServiceRequestStatus } from '@/lib/firestore'
import { Service, ServiceRequest, ServiceRequestStatus } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Plus, Pencil, Trash2, Layers, Clock } from 'lucide-react'
import { toast } from 'sonner'
import ImageUpload from '@/components/ui/ImageUpload'
import CloudImg from '@/components/ui/CloudImg'

const statusColors: Record<string, string> = {
  submitted: 'bg-yellow-100 text-yellow-700',
  reviewing: 'bg-blue-100 text-blue-700',
  in_progress: 'bg-purple-100 text-purple-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
}

const defaultForm = { name: '', description: '', price: '', turnaround: '', imageUrl: '', active: true }

export default function AdminServicesPage() {
  const [services, setServices] = useState<Service[]>([])
  const [requests, setRequests] = useState<ServiceRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [addOpen, setAddOpen] = useState(false)
  const [editService, setEditService] = useState<Service | null>(null)
  const [form, setForm] = useState(defaultForm)
  const [saving, setSaving] = useState(false)

  const load = async () => {
    try {
      const [s, r] = await Promise.all([getAllServices(), getAllServiceRequests()])
      setServices(s)
      setRequests(r)
    } catch {}
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await addService({ name: form.name, description: form.description, price: Number(form.price), turnaround: form.turnaround, imageUrl: form.imageUrl, active: form.active })
      toast.success('Service added!')
      setAddOpen(false)
      setForm(defaultForm)
      load()
    } catch { toast.error('Failed to add.') }
    setSaving(false)
  }

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editService) return
    setSaving(true)
    try {
      await updateService(editService.id, { name: form.name, description: form.description, price: Number(form.price), turnaround: form.turnaround, active: form.active })
      toast.success('Updated!')
      setEditService(null)
      load()
    } catch { toast.error('Failed to update.') }
    setSaving(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this service?')) return
    try { await deleteService(id); toast.success('Deleted.'); load() }
    catch { toast.error('Failed.') }
  }

  const handleRequestStatus = async (id: string, status: ServiceRequestStatus) => {
    try {
      await updateServiceRequestStatus(id, status)
      toast.success('Status updated.')
      load()
    } catch { toast.error('Failed.') }
  }

  const openEdit = (s: Service) => {
    setEditService(s)
    setForm({ name: s.name, description: s.description, price: String(s.price), turnaround: s.turnaround, imageUrl: s.imageUrl || '', active: s.active })
  }

  const ServiceForm = ({ onSubmit }: { onSubmit: (e: React.FormEvent) => Promise<void> }) => (
    <form onSubmit={onSubmit} className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
      <div className="space-y-1.5">
        <Label>Service Image</Label>
        <ImageUpload
          value={form.imageUrl}
          onChange={url => setForm(p => ({ ...p, imageUrl: url }))}
          label="Upload Service Image"
          folder="dpm/services"
        />
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-1.5"><Label>Service Name *</Label><Input required placeholder="Logo Design" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} /></div>
        <div className="space-y-1.5"><Label>Price (PKR) *</Label><Input required type="number" placeholder="1500" value={form.price} onChange={e => setForm(p => ({ ...p, price: e.target.value }))} /></div>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-1.5"><Label>Turnaround *</Label><Input required placeholder="2–3 days" value={form.turnaround} onChange={e => setForm(p => ({ ...p, turnaround: e.target.value }))} /></div>
        <div className="space-y-1.5"><Label>Image URL</Label><Input placeholder="https://..." value={form.imageUrl} onChange={e => setForm(p => ({ ...p, imageUrl: e.target.value }))} /></div>
      </div>
      <div className="space-y-1.5"><Label>Description *</Label><Textarea required rows={3} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} /></div>
      <div className="flex items-center gap-2"><Switch checked={form.active} onCheckedChange={v => setForm(p => ({ ...p, active: v }))} /><Label>Active</Label></div>
      <div className="flex gap-2">
        <Button type="submit" disabled={saving} className="flex-1 bg-violet-600 hover:bg-violet-700 text-white">
          {saving ? 'Saving...' : 'Save'}
        </Button>
        <Button type="button" variant="outline" onClick={() => { setAddOpen(false); setEditService(null) }}>Cancel</Button>
      </div>
    </form>
  )

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-violet-300 border-t-violet-600 rounded-full animate-spin" /></div>

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Services</h1>
      <Tabs defaultValue="services">
        <TabsList className="mb-4">
          <TabsTrigger value="services">Catalogue ({services.length})</TabsTrigger>
          <TabsTrigger value="requests">Requests ({requests.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="services">
          <div className="flex justify-end mb-4">
            <Button onClick={() => { setForm(defaultForm); setAddOpen(true) }} className="bg-violet-600 hover:bg-violet-700 text-white gap-2">
              <Plus className="w-4 h-4" /> Add Service
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {services.map(s => (
              <div key={s.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="relative h-32 bg-gradient-to-br from-violet-100 to-purple-100">
                  {s.imageUrl ? (
                    <CloudImg src={s.imageUrl} alt={s.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <Layers className="w-10 h-10 text-violet-300" />
                    </div>
                  )}
                </div>
                <div className="p-4">
                <div className="flex items-start gap-2 mb-2">
                  <div>
                    <div className="font-bold text-gray-900 text-sm">{s.name}</div>
                    <div className="text-xs text-gray-400 flex items-center gap-1"><Clock className="w-3 h-3" />{s.turnaround}</div>
                  </div>
                </div>
                <p className="text-gray-500 text-xs mb-3 line-clamp-2">{s.description}</p>
                <div className="flex items-center justify-between mb-3">
                  <div className="text-violet-700 font-bold">PKR {s.price.toLocaleString()}</div>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${s.active ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'}`}>{s.active ? 'Active' : 'Inactive'}</span>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => openEdit(s)}>
                    <Pencil className="w-3 h-3 mr-1" /> Edit
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDelete(s.id)} className="text-red-500 hover:bg-red-50 border-red-200">
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="requests">
          <div className="space-y-3">
            {requests.map(req => (
              <div key={req.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <div className="flex flex-wrap items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="font-bold text-gray-900">{req.customerName}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[req.status]}`}>{req.status.replace('_', ' ')}</span>
                    </div>
                    <div className="text-sm text-violet-700 font-medium">{req.serviceName}</div>
                    <p className="text-gray-500 text-xs mt-1 line-clamp-2">{req.description}</p>
                    {req.budget && <div className="text-xs text-gray-400 mt-0.5">Budget: PKR {req.budget.toLocaleString()}</div>}
                    {req.designerName && <div className="text-xs text-gray-500 mt-0.5">Designer: <strong>{req.designerName}</strong> {req.progress !== undefined && `· ${req.progress}% done`}</div>}
                  </div>
                  <Select value={req.status} onValueChange={(v) => { if (typeof v === 'string') handleRequestStatus(req.id, v as ServiceRequestStatus) }}>
                    <SelectTrigger className="w-36 h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {['submitted', 'reviewing', 'in_progress', 'completed', 'cancelled'].map(s => (
                        <SelectItem key={s} value={s} className="text-xs capitalize">{s.replace('_', ' ')}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ))}
            {requests.length === 0 && <div className="bg-white rounded-2xl p-10 text-center text-gray-400 shadow-sm border border-gray-100">No requests yet.</div>}
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Add Service</DialogTitle></DialogHeader>
          <ServiceForm onSubmit={handleAdd} />
        </DialogContent>
      </Dialog>

      <Dialog open={!!editService} onOpenChange={o => !o && setEditService(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Edit Service</DialogTitle></DialogHeader>
          <ServiceForm onSubmit={handleEdit} />
        </DialogContent>
      </Dialog>
    </div>
  )
}
