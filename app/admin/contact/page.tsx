'use client'

import { useEffect, useState } from 'react'
import { getContactInfo, updateContactInfo, DEFAULT_CONTACT } from '@/lib/firestore'
import { ContactInfo } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Phone, Mail, MapPin, Clock, MessageCircle, Globe, AtSign, Link2 } from 'lucide-react'
import { toast } from 'sonner'

export default function AdminContactPage() {
  const [form, setForm] = useState<ContactInfo>(DEFAULT_CONTACT)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    getContactInfo().then(setForm).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const set = <K extends keyof ContactInfo>(k: K, v: ContactInfo[K]) =>
    setForm(p => ({ ...p, [k]: v }))

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await updateContactInfo(form)
      toast.success('Contact info updated!')
    } catch { toast.error('Failed to save.') }
    setSaving(false)
  }

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-violet-300 border-t-violet-600 rounded-full animate-spin" /></div>

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Contact Info</h1>
        <p className="text-gray-500 text-sm">Shown on the Contact page and site footer.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">

        {/* Phone */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-violet-100 text-violet-600 flex items-center justify-center"><Phone className="w-4 h-4" /></div>
            <p className="font-bold text-gray-900">Phone</p>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Display Number</Label>
              <Input placeholder="+92 300 0000000" value={form.phone} onChange={e => set('phone', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5"><Link2 className="w-3.5 h-3.5" /> Call Link (optional)</Label>
              <Input placeholder="tel:+923000000000" value={form.phoneLink} onChange={e => set('phoneLink', e.target.value)} />
              <p className="text-xs text-gray-400">Leave blank to auto-generate from the number above.</p>
            </div>
          </div>
        </div>

        {/* WhatsApp */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-green-100 text-green-600 flex items-center justify-center"><MessageCircle className="w-4 h-4" /></div>
            <p className="font-bold text-gray-900">WhatsApp</p>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Display Number</Label>
              <Input placeholder="+92 300 0000000" value={form.whatsapp} onChange={e => set('whatsapp', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5"><Link2 className="w-3.5 h-3.5" /> WhatsApp Chat Link</Label>
              <Input placeholder="https://wa.me/923000000000" value={form.whatsappLink} onChange={e => set('whatsappLink', e.target.value)} />
              <p className="text-xs text-gray-400">Use a wa.me link so it opens a chat directly.</p>
            </div>
          </div>
        </div>

        {/* Email */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center"><Mail className="w-4 h-4" /></div>
            <p className="font-bold text-gray-900">Email</p>
          </div>
          <div className="space-y-1.5 max-w-md">
            <Label>Email Address</Label>
            <Input type="email" placeholder="info@dpmprinting.com" value={form.email} onChange={e => set('email', e.target.value)} />
            <p className="text-xs text-gray-400">Will be shown as a clickable mailto: link.</p>
          </div>
        </div>

        {/* Address */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-green-100 text-green-600 flex items-center justify-center"><MapPin className="w-4 h-4" /></div>
            <p className="font-bold text-gray-900">Address</p>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Address Text</Label>
              <Textarea rows={3} placeholder={'DPM Printing Center\nMain Branch, Pakistan'} value={form.address} onChange={e => set('address', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5"><Link2 className="w-3.5 h-3.5" /> Google Maps Link</Label>
              <Input placeholder="https://maps.app.goo.gl/..." value={form.mapLink} onChange={e => set('mapLink', e.target.value)} />
              <p className="text-xs text-gray-400">Paste a Google Maps share link — the address becomes clickable and opens this map.</p>
            </div>
          </div>
        </div>

        {/* Hours */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center"><Clock className="w-4 h-4" /></div>
            <p className="font-bold text-gray-900">Business Hours</p>
          </div>
          <div className="space-y-1.5 max-w-md">
            <Label>Hours Text</Label>
            <Textarea rows={2} placeholder={'Mon–Sat: 9AM – 9PM\nSunday: 10AM – 6PM'} value={form.hours} onChange={e => set('hours', e.target.value)} />
          </div>
        </div>

        {/* Social Links */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-violet-100 text-violet-600 flex items-center justify-center"><Link2 className="w-4 h-4" /></div>
            <p className="font-bold text-gray-900">Social Links</p>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5"><Globe className="w-3.5 h-3.5" /> Facebook URL</Label>
              <Input placeholder="https://facebook.com/yourpage" value={form.facebookUrl} onChange={e => set('facebookUrl', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5"><AtSign className="w-3.5 h-3.5" /> Instagram URL</Label>
              <Input placeholder="https://instagram.com/yourpage" value={form.instagramUrl} onChange={e => set('instagramUrl', e.target.value)} />
            </div>
          </div>
          <p className="text-xs text-gray-400">The WhatsApp icon in "Follow Us" reuses the WhatsApp chat link above.</p>
        </div>

        <Button type="submit" disabled={saving} className="bg-violet-600 hover:bg-violet-700 text-white px-8 h-11 font-semibold">
          {saving ? 'Saving...' : 'Save Contact Info'}
        </Button>
      </form>
    </div>
  )
}
