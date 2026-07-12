'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { updateUser } from '@/lib/firestore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Printer, User, Phone, MapPin, MessageCircle, Users, CheckCircle2 } from 'lucide-react'

export default function CompleteProfilePage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  const [form, setForm] = useState({
    name: '',
    fatherName: '',
    phone: '',
    whatsapp: '',
    address: '',
  })
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (!loading && !user) router.replace('/auth/signin')
    if (user) {
      setForm({
        name: user.name || '',
        fatherName: user.fatherName || '',
        phone: user.phone || '',
        whatsapp: user.whatsapp || '',
        address: user.address || '',
      })
      // If profile is already complete, redirect to dashboard
      if (user.profileComplete) {
        const dest = user.role === 'admin' || user.role === 'superadmin' ? '/admin' : user.role === 'designer' ? '/designer' : '/customer'
        router.replace(dest)
      }
    }
  }, [user, loading, router])

  const validate = () => {
    const e: Record<string, string> = {}
    if (form.name.trim().length < 2) e.name = 'Name must be at least 2 characters.'
    if (!/^03\d{9}$/.test(form.phone)) e.phone = 'Phone must be 11 digits starting with 03.'
    if (form.whatsapp && !/^03\d{9}$/.test(form.whatsapp)) e.whatsapp = 'WhatsApp must be 11 digits starting with 03.'
    if (form.address.trim().length < 10) e.address = 'Please enter a complete address.'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate() || !user) return
    setSaving(true)
    try {
      await updateUser(user.uid, {
        name: form.name.trim(),
        fatherName: form.fatherName.trim() || undefined,
        phone: form.phone.trim(),
        whatsapp: form.whatsapp.trim() || undefined,
        address: form.address.trim(),
        profileComplete: true,
      })
      const dest = user.role === 'admin' || user.role === 'superadmin' ? '/admin' : user.role === 'designer' ? '/designer' : '/customer'
      router.replace(dest)
    } catch {
      alert('Failed to save. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  if (loading || !user) return null

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-5/12 bg-gradient-to-br from-violet-950 via-purple-900 to-slate-900 flex-col items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        <div className="absolute -top-32 -right-32 w-80 h-80 bg-orange-500/20 rounded-full blur-3xl" />
        <div className="relative z-10 text-center">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center mx-auto mb-8 shadow-2xl">
            <Printer className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl font-extrabold text-white mb-3">One Last Step!</h2>
          <p className="text-violet-300 text-base leading-relaxed mb-10">
            Complete your profile so we can auto-fill your details when you place orders — no typing the same info every time!
          </p>
          <div className="space-y-3 text-left">
            {[
              { icon: CheckCircle2, text: 'Orders auto-filled with your info' },
              { icon: CheckCircle2, text: 'Faster checkout every time' },
              { icon: CheckCircle2, text: 'We can contact you about your order' },
              { icon: CheckCircle2, text: 'Accurate delivery address saved' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3 bg-white/10 rounded-xl px-4 py-3 text-white text-sm">
                <Icon className="w-4 h-4 text-green-400 shrink-0" />
                {text}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-start justify-center overflow-y-auto p-6 bg-gray-50">
        <div className="w-full max-w-lg py-8">
          <div className="mb-6">
            <h1 className="text-2xl font-extrabold text-gray-900 mb-1">Complete Your Profile</h1>
            <p className="text-gray-500 text-sm">
              Hi <strong>{user.name || 'there'}</strong>! Fill in your details to start ordering.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5 text-sm font-medium">
                <User className="w-3.5 h-3.5 text-violet-500" /> Full Name *
              </Label>
              <Input
                placeholder="Muhammad Ali"
                value={form.name}
                onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                className={errors.name ? 'border-red-400' : ''}
              />
              {errors.name && <p className="text-red-500 text-xs">{errors.name}</p>}
            </div>

            {/* Father's Name */}
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5 text-sm font-medium">
                <Users className="w-3.5 h-3.5 text-violet-500" /> Father&apos;s Name
              </Label>
              <Input
                placeholder="Muhammad Ahmed (optional)"
                value={form.fatherName}
                onChange={e => setForm(p => ({ ...p, fatherName: e.target.value }))}
              />
            </div>

            {/* Phone */}
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5 text-sm font-medium">
                <Phone className="w-3.5 h-3.5 text-violet-500" /> Phone Number * <span className="text-gray-400 font-normal">(11 digits)</span>
              </Label>
              <Input
                type="tel"
                placeholder="03001234567"
                maxLength={11}
                value={form.phone}
                onChange={e => setForm(p => ({ ...p, phone: e.target.value.replace(/\D/g, '') }))}
                className={errors.phone ? 'border-red-400' : ''}
              />
              {errors.phone && <p className="text-red-500 text-xs">{errors.phone}</p>}
            </div>

            {/* WhatsApp */}
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5 text-sm font-medium">
                <MessageCircle className="w-3.5 h-3.5 text-green-500" /> WhatsApp Number <span className="text-gray-400 font-normal">(optional)</span>
              </Label>
              <Input
                type="tel"
                placeholder="03001234567 (if different from phone)"
                maxLength={11}
                value={form.whatsapp}
                onChange={e => setForm(p => ({ ...p, whatsapp: e.target.value.replace(/\D/g, '') }))}
                className={errors.whatsapp ? 'border-red-400' : ''}
              />
              {errors.whatsapp && <p className="text-red-500 text-xs">{errors.whatsapp}</p>}
            </div>

            {/* Address */}
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5 text-sm font-medium">
                <MapPin className="w-3.5 h-3.5 text-violet-500" /> Delivery Address *
              </Label>
              <Textarea
                placeholder="House #, Street #, Block, Area, City (e.g. House 5, Street 12, Model Town, Lahore)"
                rows={3}
                value={form.address}
                onChange={e => setForm(p => ({ ...p, address: e.target.value }))}
                className={errors.address ? 'border-red-400' : ''}
              />
              {errors.address && <p className="text-red-500 text-xs">{errors.address}</p>}
            </div>

            <Button
              type="submit"
              disabled={saving}
              className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white py-5 font-semibold text-base shadow-lg mt-2"
            >
              {saving ? 'Saving...' : 'Save & Continue →'}
            </Button>

            <p className="text-center text-xs text-gray-400">
              You can update these details anytime from your profile settings.
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}
