'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useState } from 'react'
import { updateUser } from '@/lib/firestore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { User, Mail, Phone, Save } from 'lucide-react'
import { toast } from 'sonner'

export default function CustomerProfilePage() {
  const { user } = useAuth()
  const [name, setName] = useState(user?.name || '')
  const [phone, setPhone] = useState(user?.phone || '')
  const [saving, setSaving] = useState(false)

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    setSaving(true)
    try {
      await updateUser(user.uid, { name, phone })
      toast.success('Profile updated successfully!')
    } catch {
      toast.error('Failed to update profile.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-lg space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="font-bold text-gray-900 text-lg">{user?.name}</div>
            <div className="text-gray-500 text-sm">{user?.email}</div>
            <div className="text-xs text-violet-600 font-medium capitalize mt-0.5">{user?.role}</div>
          </div>
        </div>

        <Separator className="mb-6" />

        <form onSubmit={handleSave} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name" className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" /> Full Name
            </Label>
            <Input id="name" value={name} onChange={e => setName(e.target.value)} placeholder="Your full name" required />
          </div>
          <div className="space-y-1.5">
            <Label className="flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5" /> Email Address
            </Label>
            <Input value={user?.email || ''} disabled className="bg-gray-50 text-gray-500" />
            <p className="text-xs text-gray-400">Email cannot be changed.</p>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="phone" className="flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5" /> Phone Number
            </Label>
            <Input id="phone" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+92 300 0000000" />
          </div>
          <Button type="submit" disabled={saving} className="w-full bg-violet-600 hover:bg-violet-700 text-white gap-2">
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </form>
      </div>
    </div>
  )
}
