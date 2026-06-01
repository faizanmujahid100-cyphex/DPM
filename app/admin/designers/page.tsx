'use client'

import { useEffect, useState } from 'react'
import { getAllUsers, getDesignerOrders, getDesignerServiceRequests } from '@/lib/firestore'
import { User, Order, ServiceRequest } from '@/types'
import { Badge } from '@/components/ui/badge'
import { Palette, ShoppingBag, Layers, TrendingUp } from 'lucide-react'

export default function AdminDesignersPage() {
  const [designers, setDesigners] = useState<User[]>([])
  const [designerStats, setDesignerStats] = useState<Record<string, { orders: Order[]; requests: ServiceRequest[] }>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
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
    load()
  }, [])

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-violet-300 border-t-violet-600 rounded-full animate-spin" /></div>

  const colors = ['from-violet-500 to-purple-600', 'from-orange-500 to-pink-500', 'from-green-500 to-teal-600', 'from-blue-500 to-indigo-600', 'from-red-500 to-pink-600']

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Designers</h1>
        <p className="text-gray-500 text-sm">{designers.length} active designer{designers.length !== 1 ? 's' : ''} on the platform</p>
      </div>

      {designers.length === 0 && (
        <div className="bg-white rounded-2xl p-10 text-center text-gray-400 shadow-sm border border-gray-100">
          No designers have signed up yet.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {designers.map((designer, i) => {
          const stats = designerStats[designer.uid] || { orders: [], requests: [] }
          const completedOrders = stats.orders.filter(o => o.status === 'completed').length
          const activeOrders = stats.orders.filter(o => o.status === 'in_progress').length
          const completedRequests = stats.requests.filter(r => r.status === 'completed').length

          return (
            <div key={designer.uid} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className={`bg-gradient-to-br ${colors[i % colors.length]} p-6 flex items-center gap-4`}>
                <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-white text-2xl font-bold">
                  {designer.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="text-white font-bold text-lg">{designer.name}</div>
                  <div className="text-white/70 text-sm">{designer.email}</div>
                  <Badge className="mt-1 bg-white/20 text-white border-white/30 text-xs">Designer</Badge>
                </div>
              </div>
              <div className="p-5">
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="text-center p-3 bg-gray-50 rounded-xl">
                    <div className="text-2xl font-bold text-violet-600">{stats.orders.length}</div>
                    <div className="text-xs text-gray-500">Total Orders</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-xl">
                    <div className="text-2xl font-bold text-green-600">{completedOrders}</div>
                    <div className="text-xs text-gray-500">Completed</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-xl">
                    <div className="text-2xl font-bold text-blue-600">{activeOrders}</div>
                    <div className="text-xs text-gray-500">Active</div>
                  </div>
                </div>

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
    </div>
  )
}
