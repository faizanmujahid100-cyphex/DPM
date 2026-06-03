'use client'

import { useEffect, useState } from 'react'
import {
  getOrderFormFields, seedDefaultOrderFormFields,
  saveOrderFormField, updateOrderFormField, deleteOrderFormField,
} from '@/lib/firestore'
import { OrderFormField, FieldType } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import {
  Plus, Pencil, Trash2, ClipboardList, Eye, EyeOff,
  GripVertical, ChevronUp, ChevronDown, Lock, Info,
} from 'lucide-react'
import { toast } from 'sonner'

const FIELD_TYPES: { value: FieldType; label: string; color: string }[] = [
  { value: 'text', label: 'Text', color: 'bg-blue-100 text-blue-700' },
  { value: 'number', label: 'Number', color: 'bg-purple-100 text-purple-700' },
  { value: 'email', label: 'Email', color: 'bg-green-100 text-green-700' },
  { value: 'tel', label: 'Phone/Tel', color: 'bg-orange-100 text-orange-700' },
  { value: 'textarea', label: 'Textarea', color: 'bg-pink-100 text-pink-700' },
  { value: 'select', label: 'Dropdown', color: 'bg-cyan-100 text-cyan-700' },
]

const AUTO_FILL_OPTIONS = [
  { value: '', label: 'None' },
  { value: 'name', label: 'Full Name' },
  { value: 'fatherName', label: "Father's Name" },
  { value: 'phone', label: 'Phone Number' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'email', label: 'Email' },
  { value: 'address', label: 'Address' },
]

const emptyForm: Omit<OrderFormField, 'id'> = {
  label: '', key: '', type: 'text', placeholder: '', required: false,
  active: true, isSystem: false, order: 99,
}

export default function OrderFormPage() {
  const [fields, setFields] = useState<OrderFormField[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editField, setEditField] = useState<OrderFormField | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [optionsText, setOptionsText] = useState('')
  const [saving, setSaving] = useState(false)

  const load = async () => {
    await seedDefaultOrderFormFields()
    try { setFields(await getOrderFormFields()) } catch {}
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  const toKey = (label: string) =>
    label.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '')

  const openAdd = () => {
    setEditField(null)
    setForm({ ...emptyForm, order: fields.length + 1 })
    setOptionsText('')
    setDialogOpen(true)
  }

  const openEdit = (f: OrderFormField) => {
    setEditField(f)
    setForm({ label: f.label, key: f.key, type: f.type, placeholder: f.placeholder, required: f.required, active: f.active, isSystem: f.isSystem, minLength: f.minLength, maxLength: f.maxLength, options: f.options, autoFillKey: f.autoFillKey, order: f.order })
    setOptionsText(f.options?.join('\n') ?? '')
    setDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.label.trim()) { toast.error('Field label is required.'); return }
    setSaving(true)
    const data: Omit<OrderFormField, 'id'> = {
      ...form,
      key: form.key || toKey(form.label),
      options: form.type === 'select' ? optionsText.split('\n').map(s => s.trim()).filter(Boolean) : undefined,
    }
    try {
      if (editField) {
        await updateOrderFormField(editField.id, data)
        toast.success('Field updated!')
      } else {
        await saveOrderFormField(data)
        toast.success('Field added!')
      }
      setDialogOpen(false)
      load()
    } catch { toast.error('Failed to save.') }
    setSaving(false)
  }

  const toggleActive = async (f: OrderFormField) => {
    await updateOrderFormField(f.id, { active: !f.active })
    load()
  }

  const toggleRequired = async (f: OrderFormField) => {
    await updateOrderFormField(f.id, { required: !f.required })
    load()
  }

  const handleDelete = async (f: OrderFormField) => {
    if (f.isSystem) { toast.error('System fields cannot be deleted. Hide them instead.'); return }
    if (!confirm(`Delete field "${f.label}"?`)) return
    await deleteOrderFormField(f.id)
    toast.success('Field deleted.')
    load()
  }

  const moveField = async (idx: number, dir: -1 | 1) => {
    const newFields = [...fields]
    const target = idx + dir
    if (target < 0 || target >= newFields.length) return
    const a = newFields[idx], b = newFields[target]
    await Promise.all([
      updateOrderFormField(a.id, { order: b.order }),
      updateOrderFormField(b.id, { order: a.order }),
    ])
    load()
  }

  const typeInfo = (type: FieldType) => FIELD_TYPES.find(t => t.value === type)

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-violet-300 border-t-violet-600 rounded-full animate-spin" /></div>

  const activeFields = fields.filter(f => f.active)
  const hiddenFields = fields.filter(f => !f.active)

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Order Form Builder</h1>
          <p className="text-gray-500 text-sm mt-0.5">{activeFields.length} active field{activeFields.length !== 1 ? 's' : ''} shown to customers at checkout</p>
        </div>
        <Button onClick={openAdd} className="bg-violet-600 hover:bg-violet-700 text-white gap-2">
          <Plus className="w-4 h-4" /> Add Field
        </Button>
      </div>

      {/* Info banner */}
      <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-xl border border-blue-100 text-sm text-blue-700">
        <Info className="w-5 h-5 shrink-0 mt-0.5 text-blue-500" />
        <div>
          <strong>Auto-fill:</strong> Fields with a profile key (like Name, Phone, Email) auto-fill from the customer&apos;s saved profile. Customers can still edit them before placing the order.
          System fields (<Lock className="w-3 h-3 inline" />) cannot be deleted but can be hidden.
        </div>
      </div>

      {/* Active fields */}
      <div className="space-y-2">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-2">
          <Eye className="w-4 h-4" /> Active Fields — shown at checkout
        </h2>
        {activeFields.length === 0 && (
          <div className="bg-white rounded-xl p-6 text-center text-gray-400 border border-gray-100">
            No active fields. Add fields or unhide existing ones.
          </div>
        )}
        {activeFields.map((field, idx) => (
          <FieldCard
            key={field.id}
            field={field}
            idx={idx}
            total={activeFields.length}
            onEdit={() => openEdit(field)}
            onDelete={() => handleDelete(field)}
            onToggleActive={() => toggleActive(field)}
            onToggleRequired={() => toggleRequired(field)}
            onMove={dir => moveField(fields.indexOf(field), dir)}
            typeInfo={typeInfo(field.type)}
          />
        ))}
      </div>

      {/* Hidden fields */}
      {hiddenFields.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide flex items-center gap-2">
            <EyeOff className="w-4 h-4" /> Hidden Fields
          </h2>
          {hiddenFields.map((field, idx) => (
            <FieldCard
              key={field.id}
              field={field}
              idx={idx}
              total={hiddenFields.length}
              onEdit={() => openEdit(field)}
              onDelete={() => handleDelete(field)}
              onToggleActive={() => toggleActive(field)}
              onToggleRequired={() => toggleRequired(field)}
              onMove={() => {}}
              typeInfo={typeInfo(field.type)}
              hidden
            />
          ))}
        </div>
      )}

      {/* Live Preview */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h2 className="font-bold text-gray-900 mb-1 flex items-center gap-2">
          <ClipboardList className="w-5 h-5 text-violet-500" />
          Live Form Preview
        </h2>
        <p className="text-gray-400 text-xs mb-5">This is how the form looks to customers at checkout.</p>
        <div className="space-y-4">
          {activeFields.map(field => (
            <div key={field.id} className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                {field.label}
                {field.required && <span className="text-red-500 text-xs">*</span>}
                {field.autoFillKey && <span className="text-xs text-violet-500 font-normal">(auto-filled)</span>}
              </label>
              {field.type === 'textarea' ? (
                <textarea
                  placeholder={field.placeholder}
                  rows={3}
                  disabled
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 text-gray-400 resize-none"
                />
              ) : field.type === 'select' ? (
                <select disabled className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 text-gray-400">
                  <option>{field.placeholder || 'Select option...'}</option>
                  {field.options?.map(o => <option key={o}>{o}</option>)}
                </select>
              ) : (
                <input
                  type={field.type}
                  placeholder={field.placeholder}
                  disabled
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 text-gray-400"
                />
              )}
              {(field.minLength || field.maxLength) && (
                <p className="text-xs text-gray-400">
                  {field.minLength && field.maxLength && field.minLength === field.maxLength
                    ? `Exactly ${field.minLength} characters`
                    : [field.minLength && `Min ${field.minLength}`, field.maxLength && `Max ${field.maxLength}`].filter(Boolean).join(' · ') + ' characters'}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={o => !o && setDialogOpen(false)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editField ? `Edit: ${editField.label}` : 'Add New Field'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 max-h-[80vh] overflow-y-auto pr-1 mt-2">

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Field Label *</Label>
                <Input
                  placeholder="e.g. Phone Number"
                  required
                  value={form.label}
                  onChange={e => setForm(p => ({ ...p, label: e.target.value, key: p.key || toKey(e.target.value) }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Field Key</Label>
                <Input
                  placeholder="phone_number"
                  value={form.key}
                  onChange={e => setForm(p => ({ ...p, key: e.target.value.replace(/\s/g, '_').toLowerCase() }))}
                />
                <p className="text-xs text-gray-400">Internal identifier. Auto-set from label.</p>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Input Type *</Label>
              <Select value={form.type} onValueChange={v => v && setForm(p => ({ ...p, type: v as FieldType }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {FIELD_TYPES.map(t => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Placeholder Text</Label>
              <Input
                placeholder="e.g. Enter your phone number"
                value={form.placeholder}
                onChange={e => setForm(p => ({ ...p, placeholder: e.target.value }))}
              />
            </div>

            {/* Dropdown options */}
            {form.type === 'select' && (
              <div className="space-y-1.5">
                <Label>Dropdown Options (one per line)</Label>
                <textarea
                  rows={4}
                  placeholder={"Option 1\nOption 2\nOption 3"}
                  value={optionsText}
                  onChange={e => setOptionsText(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-violet-300"
                />
              </div>
            )}

            {/* Length constraints */}
            {(form.type === 'text' || form.type === 'tel' || form.type === 'textarea' || form.type === 'number') && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>
                    {form.type === 'number' ? 'Min Value' : 'Min Characters'}
                  </Label>
                  <Input
                    type="number"
                    min={0}
                    placeholder={form.type === 'tel' ? '11' : '0'}
                    value={form.minLength ?? ''}
                    onChange={e => setForm(p => ({ ...p, minLength: e.target.value ? Number(e.target.value) : undefined }))}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>
                    {form.type === 'number' ? 'Max Value' : 'Max Characters'}
                  </Label>
                  <Input
                    type="number"
                    min={0}
                    placeholder={form.type === 'tel' ? '11' : ''}
                    value={form.maxLength ?? ''}
                    onChange={e => setForm(p => ({ ...p, maxLength: e.target.value ? Number(e.target.value) : undefined }))}
                  />
                </div>
              </div>
            )}

            {/* Auto-fill from profile */}
            <div className="space-y-1.5">
              <Label>Auto-fill from Customer Profile</Label>
              <Select
                value={form.autoFillKey ?? ''}
                onValueChange={v => setForm(p => ({ ...p, autoFillKey: v || undefined }))}
              >
                <SelectTrigger><SelectValue placeholder="None — customer fills manually" /></SelectTrigger>
                <SelectContent>
                  {AUTO_FILL_OPTIONS.map(o => (
                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-400">If set, this field pre-fills from the customer&apos;s saved profile data.</p>
            </div>

            <Separator />

            {/* Toggles */}
            <div className="flex gap-8">
              <div className="flex items-center gap-2.5">
                <Switch checked={form.required} onCheckedChange={v => setForm(p => ({ ...p, required: v }))} />
                <div>
                  <Label className="text-sm">Required</Label>
                  <p className="text-xs text-gray-400">Customer must fill this</p>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <Switch checked={form.active} onCheckedChange={v => setForm(p => ({ ...p, active: v }))} />
                <div>
                  <Label className="text-sm">Visible</Label>
                  <p className="text-xs text-gray-400">Show in order form</p>
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button type="submit" disabled={saving} className="flex-1 bg-violet-600 hover:bg-violet-700 text-white">
                {saving ? 'Saving...' : editField ? 'Update Field' : 'Add Field'}
              </Button>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ── Field Card Component ──────────────────────────────────────────────────────

function FieldCard({ field, idx, total, onEdit, onDelete, onToggleActive, onToggleRequired, onMove, typeInfo, hidden }: {
  field: OrderFormField
  idx: number
  total: number
  onEdit: () => void
  onDelete: () => void
  onToggleActive: () => void
  onToggleRequired: () => void
  onMove: (dir: -1 | 1) => void
  typeInfo?: { color: string; label: string }
  hidden?: boolean
}) {
  return (
    <div className={`bg-white rounded-xl border p-4 flex items-center gap-3 transition-all ${hidden ? 'border-gray-100 opacity-60' : 'border-gray-200 hover:border-violet-200 hover:shadow-sm'}`}>
      {/* Order arrows */}
      {!hidden && (
        <div className="flex flex-col gap-0.5 shrink-0">
          <button onClick={() => onMove(-1)} disabled={idx === 0} className="p-0.5 text-gray-300 hover:text-gray-600 disabled:opacity-20 transition-colors">
            <ChevronUp className="w-4 h-4" />
          </button>
          <button onClick={() => onMove(1)} disabled={idx === total - 1} className="p-0.5 text-gray-300 hover:text-gray-600 disabled:opacity-20 transition-colors">
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Icon */}
      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shrink-0 shadow-sm">
        <GripVertical className="w-4 h-4 text-white" />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-gray-900 text-sm">{field.label}</span>
          {field.isSystem && <Lock className="w-3 h-3 text-gray-400" />}
          {typeInfo && <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${typeInfo.color}`}>{typeInfo.label}</span>}
          {field.autoFillKey && <span className="text-xs px-2 py-0.5 rounded-full bg-violet-100 text-violet-600 font-medium">Auto-fill: {field.autoFillKey}</span>}
        </div>
        <div className="flex items-center gap-3 mt-1">
          <span className="text-xs text-gray-400 truncate">{field.placeholder || <em>No placeholder</em>}</span>
          {(field.minLength || field.maxLength) && (
            <span className="text-xs text-gray-400 shrink-0">
              {field.minLength === field.maxLength ? `${field.minLength} chars` : [field.minLength && `≥${field.minLength}`, field.maxLength && `≤${field.maxLength}`].filter(Boolean).join(' ')}
            </span>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="flex flex-col items-center gap-0.5">
          <Switch checked={field.required} onCheckedChange={onToggleRequired} />
          <span className="text-xs text-gray-400">{field.required ? 'Required' : 'Optional'}</span>
        </div>
        <div className="flex flex-col items-center gap-0.5">
          <Switch checked={field.active} onCheckedChange={onToggleActive} />
          <span className="text-xs text-gray-400">{field.active ? 'Visible' : 'Hidden'}</span>
        </div>
        <button onClick={onEdit} className="p-1.5 rounded-lg bg-violet-100 text-violet-600 hover:bg-violet-200 transition-colors">
          <Pencil className="w-3.5 h-3.5" />
        </button>
        {!field.isSystem && (
          <button onClick={onDelete} className="p-1.5 rounded-lg bg-red-100 text-red-500 hover:bg-red-200 transition-colors">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  )
}
