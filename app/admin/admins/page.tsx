'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { getAllUsers, createUser, updateUser } from '@/lib/firestore'
import { User } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { ShieldCheck, UserPlus, Eye, EyeOff, UserMinus } from 'lucide-react'
import { toast } from 'sonner'

async function createAdminAccount(email: string, password: string, name: string) {
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY
  const res = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, returnSecureToken: false }),
    }
  )
  const data = await res.json()
  if (data.error) throw new Error(data.error.message)
  // Create Firestore user doc with admin role
  await createUser(data.localId, { email, name, role: 'admin' })
  return data.localId
}

export default function SuperAdminAdminsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [admins, setAdmins] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [addOpen, setAddOpen] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [creating, setCreating] = useState(false)
  const [removing, setRemoving] = useState<string | null>(null)

  const isSuperAdmin = user?.role === 'superadmin'

  useEffect(() => {
    if (user && !isSuperAdmin) router.replace('/admin')
  }, [user, isSuperAdmin, router])

  const load = async () => {
    try {
      const users = await getAllUsers()
      setAdmins(users.filter(u => u.role === 'admin'))
    } catch {}
    setLoading(false)
  }

  useEffect(() => { if (isSuperAdmin) load() }, [isSuperAdmin])

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.password) return
    setCreating(true)
    try {
      await createAdminAccount(form.email, form.password, form.name)
      toast.success(`Admin account created for ${form.name}`)
      setAddOpen(false)
      setForm({ name: '', email: '', password: '' })
      load()
    } catch (err: any) {
      toast.error(err.message || 'Failed to create admin account.')
    } finally {
      setCreating(false)
    }
  }

  const handleRemoveAdmin = async (admin: User) => {
    if (!confirm(`Remove admin access for ${admin.name}? Their account will become a customer account.`)) return
    setRemoving(admin.uid)
    try {
      await updateUser(admin.uid, { role: 'customer' })
      toast.success(`${admin.name} is no longer an admin.`)
      load()
    } catch (err: any) {
      toast.error(err.message || 'Failed to remove admin.')
    } finally {
      setRemoving(null)
    }
  }

  if (!isSuperAdmin) return null

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="w-8 h-8 border-2 border-violet-300 border-t-violet-600 rounded-full animate-spin" />
    </div>
  )

  const colors = [
    'from-red-500 to-pink-600',
    'from-violet-500 to-purple-600',
    'from-blue-500 to-indigo-600',
    'from-green-500 to-teal-600',
    'from-orange-500 to-pink-500',
    'from-cyan-500 to-blue-600',
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admins</h1>
          <p className="text-gray-500 text-sm">{admins.length} admin account{admins.length !== 1 ? 's' : ''}</p>
        </div>
        <Button
          onClick={() => setAddOpen(true)}
          className="bg-violet-600 hover:bg-violet-700 text-white gap-2"
        >
          <UserPlus className="w-4 h-4" />
          Add Admin
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {admins.map((admin, i) => (
          <div key={admin.uid} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className={`bg-gradient-to-br ${colors[i % colors.length]} p-6 flex items-center gap-4`}>
              <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center text-white text-2xl font-bold shrink-0">
                {admin.name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <div className="text-white font-bold text-lg truncate">{admin.name}</div>
                <div className="text-white/70 text-sm truncate">{admin.email}</div>
                <Badge className="mt-1 bg-white/20 text-white border-white/30 text-xs gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  Admin
                </Badge>
              </div>
            </div>

            <div className="p-4 flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                disabled={removing === admin.uid}
                onClick={() => handleRemoveAdmin(admin)}
                className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 gap-2"
              >
                <UserMinus className="w-4 h-4" />
                {removing === admin.uid ? 'Removing...' : 'Remove Admin'}
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Admin Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-violet-600" />
              Add New Admin
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddAdmin} className="space-y-4 mt-2">
            <div className="p-3 bg-violet-50 rounded-xl text-xs text-violet-700">
              The admin will use these credentials to sign in. They get full admin panel access but cannot manage other admins.
            </div>
            <div className="space-y-1.5">
              <Label>Full Name *</Label>
              <Input
                placeholder="Admin's full name"
                required
                value={form.name}
                onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Email *</Label>
              <Input
                type="email"
                placeholder="admin@example.com"
                required
                value={form.email}
                onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Temporary Password *</Label>
              <div className="relative">
                <Input
                  type={showPass ? 'text' : 'password'}
                  placeholder="Min 6 characters"
                  required
                  minLength={6}
                  value={form.password}
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                type="submit"
                disabled={creating}
                className="flex-1 bg-violet-600 hover:bg-violet-700 text-white"
              >
                {creating ? 'Creating...' : 'Create Admin'}
              </Button>
              <Button type="button" variant="outline" onClick={() => setAddOpen(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
