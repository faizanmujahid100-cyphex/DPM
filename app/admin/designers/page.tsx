'use client'

import { useEffect, useState } from 'react'
import { getAllUsers, getDesignerOrders, getDesignerServiceRequests, createUser } from '@/lib/firestore'
import { User, Order, ServiceRequest } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { ShoppingBag, Layers, UserPlus, Eye, EyeOff } from 'lucide-react'
import { toast } from 'sonner'

async function createDesignerAccount(email: string, password: string, name: string) {
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
  // Create Firestore user doc with designer role
  await createUser(data.localId, { email, name, role: 'designer' })
  return data.localId
}

export default function AdminDesignersPage() {
  const [designers, setDesigners] = useState<User[]>([])
  const [designerStats, setDesignerStats] = useState<Record<string, { orders: Order[]; requests: ServiceRequest[] }>>({})
  const [loading, setLoading] = useState(true)
  const [addOpen, setAddOpen] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [creating, setCreating] = useState(false)

  const load = async () => {
    try {
      const users = await getAllUsers()
      const d = users.filter(u => u.role === 'designer')
      setDesigners(d)
      const stats: Record<string, { orders: Order[]; requests: ServiceRequest[] }> = {}
      await Promise.all(d.map(async designer => {
        const [orders, requests] = await Promise.all([
          getDesignerOrders(designer.uid),
          getDesignerServiceRequests(designer.uid),
        ])
        stats[designer.uid] = { orders, requests }
      }))
      setDesignerStats(stats)
    } catch {}
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const handleAddDesigner = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.password) return
    setCreating(true)
    try {
      await createDesignerAccount(form.email, form.password, form.name)
      toast.success(`Designer account created for ${form.name}`)
      setAddOpen(false)
      setForm({ name: '', email: '', password: '' })
      load()
    } catch (err: any) {
      toast.error(err.message || 'Failed to create designer account.')
    } finally {
      setCreating(false)
    }
  }

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="w-8 h-8 border-2 border-violet-300 border-t-violet-600 rounded-full animate-spin" />
    </div>
  )

  const colors = [
    'from-violet-500 to-purple-600',
    'from-orange-500 to-pink-500',
    'from-green-500 to-teal-600',
    'from-blue-500 to-indigo-600',
    'from-red-500 to-pink-600',
    'from-cyan-500 to-blue-600',
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Designers</h1>
          <p className="text-gray-500 text-sm">{designers.length} active designer{designers.length !== 1 ? 's' : ''}</p>
        </div>
        <Button
          onClick={() => setAddOpen(true)}
          className="bg-violet-600 hover:bg-violet-700 text-white gap-2"
        >
          <UserPlus className="w-4 h-4" />
          Add Designer
        </Button>
      </div>

      {designers.length === 0 && (
        <div className="bg-white rounded-2xl p-10 text-center shadow-sm border border-gray-100">
          <UserPlus className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-gray-600 font-semibold mb-2">No designers yet</h3>
          <p className="text-gray-400 text-sm mb-4">Add your first designer to start assigning orders.</p>
          <Button onClick={() => setAddOpen(true)} className="bg-violet-600 hover:bg-violet-700 text-white gap-2">
            <UserPlus className="w-4 h-4" /> Add Designer
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {designers.map((designer, i) => {
          const stats = designerStats[designer.uid] || { orders: [], requests: [] }
          const completedOrders = stats.orders.filter(o => o.status === 'completed').length
          const activeOrders = stats.orders.filter(o => o.status === 'in_progress').length
          const avgProgress = activeOrders > 0
            ? Math.round(stats.orders.filter(o => o.status === 'in_progress').reduce((sum, o) => sum + (o.designerProgress || 0), 0) / activeOrders)
            : 0

          return (
            <div key={designer.uid} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className={`bg-gradient-to-br ${colors[i % colors.length]} p-6 flex items-center gap-4`}>
                <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center text-white text-2xl font-bold shrink-0">
                  {designer.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <div className="text-white font-bold text-lg truncate">{designer.name}</div>
                  <div className="text-white/70 text-sm truncate">{designer.email}</div>
                  <Badge className="mt-1 bg-white/20 text-white border-white/30 text-xs">Designer</Badge>
                </div>
              </div>

              <div className="p-5">
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="text-center p-3 bg-gray-50 rounded-xl">
                    <div className="text-2xl font-bold text-violet-600">{stats.orders.length}</div>
                    <div className="text-xs text-gray-500">Orders</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-xl">
                    <div className="text-2xl font-bold text-green-600">{completedOrders}</div>
                    <div className="text-xs text-gray-500">Done</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-xl">
                    <div className="text-2xl font-bold text-blue-600">{activeOrders}</div>
                    <div className="text-xs text-gray-500">Active</div>
                  </div>
                </div>

                {activeOrders > 0 && (
                  <div className="mb-4">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Avg progress on active orders</span>
                      <span className="font-semibold text-violet-600">{avgProgress}%</span>
                    </div>
                    <Progress value={avgProgress} className="h-1.5" />
                  </div>
                )}

                <div className="space-y-2">
                  {stats.orders.filter(o => o.status === 'in_progress').slice(0, 2).map(order => (
                    <div key={order.id} className="flex items-center gap-2 p-2.5 bg-blue-50 rounded-xl">
                      <ShoppingBag className="w-4 h-4 text-blue-500 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium text-gray-800 truncate">{order.customerName}</div>
                        <div className="text-xs text-gray-500">{order.designerProgress || 0}% complete</div>
                      </div>
                    </div>
                  ))}
                  {stats.requests.filter(r => r.status === 'in_progress').slice(0, 1).map(req => (
                    <div key={req.id} className="flex items-center gap-2 p-2.5 bg-purple-50 rounded-xl">
                      <Layers className="w-4 h-4 text-purple-500 shrink-0" />
                      <div className="min-w-0">
                        <div className="text-xs font-medium text-gray-800 truncate">{req.serviceName}</div>
                        <div className="text-xs text-gray-500">{req.progress || 0}% done</div>
                      </div>
                    </div>
                  ))}
                  {activeOrders === 0 && stats.requests.filter(r => r.status === 'in_progress').length === 0 && (
                    <div className="text-center py-2 text-xs text-gray-400">No active assignments</div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Add Designer Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-violet-600" />
              Add New Designer
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddDesigner} className="space-y-4 mt-2">
            <div className="p-3 bg-violet-50 rounded-xl text-xs text-violet-700">
              The designer will use these credentials to sign in to their panel.
            </div>
            <div className="space-y-1.5">
              <Label>Full Name *</Label>
              <Input
                placeholder="Designer's full name"
                required
                value={form.name}
                onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Email *</Label>
              <Input
                type="email"
                placeholder="designer@example.com"
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
                {creating ? 'Creating...' : 'Create Designer'}
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
