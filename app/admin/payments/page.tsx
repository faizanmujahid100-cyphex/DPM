'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import {
  getPaymentMethods, addPaymentMethod, updatePaymentMethod, deletePaymentMethod,
  getPaymentSettings, updatePaymentSettings, DEFAULT_PAYMENT_SETTINGS,
} from '@/lib/firestore'
import { PaymentMethod, PaymentSettings } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import ImageUpload from '@/components/ui/ImageUpload'
import { Wallet, Plus, Pencil, Trash2, QrCode, MessageCircle, Mail, Save } from 'lucide-react'
import { toast } from 'sonner'

const EMPTY_FORM = { name: '', accountName: '', accountNumber: '', qrCodeUrl: '', instructions: '', active: true }

export default function SuperAdminPaymentsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const isSuperAdmin = user?.role === 'superadmin'

  const [methods, setMethods]   = useState<PaymentMethod[]>([])
  const [settings, setSettings] = useState<PaymentSettings>(DEFAULT_PAYMENT_SETTINGS)
  const [loading, setLoading]   = useState(true)

  // method dialog
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<PaymentMethod | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)

  // settings
  const [savingSettings, setSavingSettings] = useState(false)

  useEffect(() => {
    if (user && !isSuperAdmin) router.replace('/admin')
  }, [user, isSuperAdmin, router])

  const load = async () => {
    try {
      const [m, s] = await Promise.all([getPaymentMethods(), getPaymentSettings()])
      setMethods(m)
      setSettings(s)
    } catch {}
    setLoading(false)
  }

  useEffect(() => { if (isSuperAdmin) load() }, [isSuperAdmin])

  const openAdd = () => { setEditing(null); setForm(EMPTY_FORM); setDialogOpen(true) }
  const openEdit = (m: PaymentMethod) => {
    setEditing(m)
    setForm({
      name: m.name,
      accountName: m.accountName,
      accountNumber: m.accountNumber,
      qrCodeUrl: m.qrCodeUrl ?? '',
      instructions: m.instructions ?? '',
      active: m.active,
    })
    setDialogOpen(true)
  }

  const handleSaveMethod = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim() || !form.accountNumber.trim()) {
      toast.error('Method name and account number are required.')
      return
    }
    setSaving(true)
    try {
      if (editing) {
        await updatePaymentMethod(editing.id, form)
        toast.success('Payment method updated.')
      } else {
        await addPaymentMethod(form)
        toast.success('Payment method added.')
      }
      setDialogOpen(false)
      load()
    } catch {
      toast.error('Failed to save payment method.')
    } finally {
      setSaving(false)
    }
  }

  const handleToggleActive = async (m: PaymentMethod) => {
    try {
      await updatePaymentMethod(m.id, { active: !m.active })
      setMethods(prev => prev.map(x => x.id === m.id ? { ...x, active: !m.active } : x))
    } catch {
      toast.error('Failed to update.')
    }
  }

  const handleDelete = async (m: PaymentMethod) => {
    if (!confirm(`Delete "${m.name}"? It will no longer show on checkout.`)) return
    try {
      await deletePaymentMethod(m.id)
      toast.success('Payment method deleted.')
      setMethods(prev => prev.filter(x => x.id !== m.id))
    } catch {
      toast.error('Failed to delete.')
    }
  }

  const handleSaveSettings = async () => {
    setSavingSettings(true)
    try {
      await updatePaymentSettings(settings)
      toast.success('Payment settings saved.')
    } catch {
      toast.error('Failed to save settings.')
    } finally {
      setSavingSettings(false)
    }
  }

  if (!isSuperAdmin) return null

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="w-8 h-8 border-2 border-violet-300 border-t-violet-600 rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="space-y-8">
      {/* ── Payment methods ── */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Payment Methods</h1>
            <p className="text-gray-500 text-sm">These are shown to customers on the checkout page.</p>
          </div>
          <Button onClick={openAdd} className="bg-violet-600 hover:bg-violet-700 text-white gap-2">
            <Plus className="w-4 h-4" /> Add Method
          </Button>
        </div>

        {methods.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 text-center shadow-sm border border-gray-100">
            <Wallet className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-gray-600 font-semibold mb-1">No payment methods yet</h3>
            <p className="text-gray-400 text-sm">Add JazzCash, EasyPaisa, a bank account, or any other method customers can pay with.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {methods.map(m => (
              <div key={m.id} className={`bg-white rounded-2xl shadow-sm border overflow-hidden ${m.active ? 'border-gray-100' : 'border-gray-200 opacity-60'}`}>
                <div className="p-5">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center shrink-0">
                        <Wallet className="w-5 h-5 text-violet-600" />
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-gray-900 truncate">{m.name}</div>
                        <Badge className={`text-[10px] ${m.active ? 'bg-green-100 text-green-700 border-green-200' : 'bg-gray-100 text-gray-500 border-gray-200'}`}>
                          {m.active ? 'Visible on checkout' : 'Hidden'}
                        </Badge>
                      </div>
                    </div>
                    <Switch checked={m.active} onCheckedChange={() => handleToggleActive(m)} />
                  </div>

                  <div className="space-y-1 text-sm">
                    {m.accountName && (
                      <div className="text-gray-500">Account: <span className="font-semibold text-gray-800">{m.accountName}</span></div>
                    )}
                    <div className="text-gray-500">Number: <span className="font-mono font-semibold text-gray-800">{m.accountNumber}</span></div>
                    {m.instructions && <p className="text-xs text-gray-400 pt-1">{m.instructions}</p>}
                  </div>

                  {m.qrCodeUrl && (
                    <div className="mt-3 flex items-center gap-2">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={m.qrCodeUrl} alt={`${m.name} QR code`} className="w-20 h-20 rounded-lg border border-gray-200 object-contain bg-white" />
                      <span className="flex items-center gap-1 text-xs text-gray-400"><QrCode className="w-3.5 h-3.5" /> QR code</span>
                    </div>
                  )}
                </div>

                <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-end gap-2">
                  <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={() => openEdit(m)}>
                    <Pencil className="w-3 h-3" /> Edit
                  </Button>
                  <Button variant="outline" size="sm" className="gap-1.5 text-xs text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700" onClick={() => handleDelete(m)}>
                    <Trash2 className="w-3 h-3" /> Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Screenshot receiving settings ── */}
      <div>
        <div className="mb-5">
          <h2 className="text-xl font-bold text-gray-900">Payment Verification</h2>
          <p className="text-gray-500 text-sm">Where customers send their payment screenshots. Shown on checkout with the customer&apos;s Payment ID.</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 max-w-2xl space-y-4">
          <div className="space-y-1.5">
            <Label className="flex items-center gap-1.5"><MessageCircle className="w-4 h-4 text-green-600" /> WhatsApp Number</Label>
            <Input
              placeholder="e.g. 03001234567"
              value={settings.whatsapp}
              onChange={e => setSettings(p => ({ ...p, whatsapp: e.target.value }))}
            />
            <p className="text-xs text-gray-400">Customers will send payment screenshots to this WhatsApp number.</p>
          </div>

          <div className="space-y-1.5">
            <Label className="flex items-center gap-1.5"><Mail className="w-4 h-4 text-violet-600" /> Email Address</Label>
            <Input
              type="email"
              placeholder="e.g. payments@dpmprinting.com"
              value={settings.email}
              onChange={e => setSettings(p => ({ ...p, email: e.target.value }))}
            />
            <p className="text-xs text-gray-400">Customers can also email their payment screenshots here.</p>
          </div>

          <div className="space-y-1.5">
            <Label>Instructions for Customers</Label>
            <Textarea
              rows={3}
              placeholder="e.g. After paying, send a screenshot with your Payment ID..."
              value={settings.instructions}
              onChange={e => setSettings(p => ({ ...p, instructions: e.target.value }))}
            />
          </div>

          <Button onClick={handleSaveSettings} disabled={savingSettings} className="bg-violet-600 hover:bg-violet-700 text-white gap-2">
            <Save className="w-4 h-4" />
            {savingSettings ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </div>

      {/* ── Add / Edit dialog ── */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wallet className="w-5 h-5 text-violet-600" />
              {editing ? 'Edit Payment Method' : 'Add Payment Method'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveMethod} className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label>Method Name *</Label>
              <Input
                placeholder="e.g. JazzCash, EasyPaisa, Bank Transfer"
                required
                value={form.name}
                onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Account Holder Name</Label>
              <Input
                placeholder="e.g. Muhammad Ali"
                value={form.accountName}
                onChange={e => setForm(p => ({ ...p, accountName: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Account Number / IBAN *</Label>
              <Input
                placeholder="e.g. 03001234567"
                required
                value={form.accountNumber}
                onChange={e => setForm(p => ({ ...p, accountNumber: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label>QR Code (optional)</Label>
              <ImageUpload
                value={form.qrCodeUrl}
                onChange={url => setForm(p => ({ ...p, qrCodeUrl: url }))}
                label="Upload QR Code"
                folder="dpm/payments"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Instructions (optional)</Label>
              <Textarea
                rows={2}
                placeholder="e.g. Send to this number via JazzCash app"
                value={form.instructions}
                onChange={e => setForm(p => ({ ...p, instructions: e.target.value }))}
              />
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
              <div>
                <div className="text-sm font-semibold text-gray-800">Show on checkout</div>
                <div className="text-xs text-gray-400">Customers will see this method when placing an order</div>
              </div>
              <Switch checked={form.active} onCheckedChange={v => setForm(p => ({ ...p, active: v }))} />
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={saving} className="flex-1 bg-violet-600 hover:bg-violet-700 text-white">
                {saving ? 'Saving...' : editing ? 'Save Changes' : 'Add Method'}
              </Button>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
