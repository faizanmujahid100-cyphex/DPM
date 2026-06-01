'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useEffect, useState } from 'react'
import { getDesignerOrders, getAvailableOrders, getDesignerServiceRequests, getAvailableServiceRequests, bidOnOrder, bidOnServiceRequest } from '@/lib/firestore'
import { Order, ServiceRequest } from '@/types'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { ShoppingBag, Layers, Zap, CheckCircle, Clock, TrendingUp } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'

export default function DesignerDashboard() {
  const { user } = useAuth()
  const [myOrders, setMyOrders] = useState<Order[]>([])
  const [availableOrders, setAvailableOrders] = useState<Order[]>([])
  const [myRequests, setMyRequests] = useState<ServiceRequest[]>([])
  const [availableRequests, setAvailableRequests] = useState<ServiceRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [bidding, setBidding] = useState<string | null>(null)

  const load = async () => {
    if (!user) return
    try {
      const [mo, ao, mr, ar] = await Promise.all([
        getDesignerOrders(user.uid),
        getAvailableOrders(),
        getDesignerServiceRequests(user.uid),
        getAvailableServiceRequests(),
      ])
      setMyOrders(mo)
      setAvailableOrders(ao)
      setMyRequests(mr)
      setAvailableRequests(ar)
    } catch {}
    setLoading(false)
  }

  useEffect(() => { load() }, [user])

  const handleBidOrder = async (orderId: string) => {
    if (!user) return
    setBidding(orderId)
    const success = await bidOnOrder(orderId, user.uid, user.name)
    setBidding(null)
    if (success) {
      toast.success('You got the order! Start working on it.')
      load()
    } else {
      toast.error('Another designer got there first. Try another order.')
      load()
    }
  }

  const handleBidRequest = async (requestId: string) => {
    if (!user) return
    setBidding(requestId)
    const success = await bidOnServiceRequest(requestId, user.uid, user.name)
    setBidding(null)
    if (success) {
      toast.success("You've accepted the service request!")
      load()
    } else {
      toast.error('Already taken by another designer.')
      load()
    }
  }

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-orange-300 border-t-orange-600 rounded-full animate-spin" /></div>

  const activeOrders = myOrders.filter(o => o.status === 'in_progress')
  const completedOrders = myOrders.filter(o => o.status === 'completed')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Welcome, {user?.name}!</h1>
        <p className="text-gray-500 text-sm">Your designer workspace</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { label: 'Active Orders', value: activeOrders.length, icon: ShoppingBag, color: 'from-blue-500 to-indigo-600' },
          { label: 'Available to Bid', value: availableOrders.length, icon: Zap, color: 'from-orange-500 to-amber-500' },
          { label: 'Completed', value: completedOrders.length, icon: CheckCircle, color: 'from-green-500 to-teal-600' },
          { label: 'Service Requests', value: myRequests.length, icon: Layers, color: 'from-violet-500 to-purple-600' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-3`}>
              <Icon className="w-5 h-5 text-white" />
            </div>
            <div className="text-3xl font-extrabold text-gray-900">{value}</div>
            <div className="text-sm text-gray-500">{label}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        {/* Available Orders */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
            <Zap className="w-4 h-4 text-orange-500" />
            <h2 className="font-bold text-gray-900">Available Orders — Bid First!</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {availableOrders.map(order => (
              <div key={order.id} className="px-5 py-4 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 text-sm">{order.customerName}</div>
                  <div className="text-xs text-gray-400">{order.items.length} item(s) · PKR {order.total.toLocaleString()}</div>
                  {order.notes && <div className="text-xs text-gray-500 mt-0.5 italic truncate">{order.notes}</div>}
                </div>
                <Button
                  size="sm"
                  onClick={() => handleBidOrder(order.id)}
                  disabled={bidding === order.id}
                  className="bg-orange-500 hover:bg-orange-600 text-white shrink-0 text-xs"
                >
                  {bidding === order.id ? 'Claiming...' : 'Accept'}
                </Button>
              </div>
            ))}
            {availableOrders.length === 0 && (
              <div className="px-5 py-8 text-center text-gray-400 text-sm flex flex-col items-center gap-2">
                <CheckCircle className="w-6 h-6 text-green-400" />
                No available orders right now.
              </div>
            )}
          </div>
        </div>

        {/* My Active Orders */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-blue-500" />
              <h2 className="font-bold text-gray-900">My Active Orders</h2>
            </div>
            <Link href="/designer/orders">
              <span className="text-xs text-violet-600 hover:underline">View all</span>
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {activeOrders.slice(0, 5).map(order => (
              <div key={order.id} className="px-5 py-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-medium text-gray-900 text-sm">{order.customerName}</div>
                  <span className="text-xs text-blue-600 font-semibold">{order.designerProgress || 0}%</span>
                </div>
                <Progress value={order.designerProgress || 0} className="h-1.5" />
                <div className="text-xs text-gray-400 mt-1">{order.items.length} item(s) · PKR {order.total.toLocaleString()}</div>
              </div>
            ))}
            {activeOrders.length === 0 && (
              <div className="px-5 py-8 text-center text-gray-400 text-sm">No active orders.</div>
            )}
          </div>
        </div>

        {/* Available Service Requests */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
            <Layers className="w-4 h-4 text-violet-500" />
            <h2 className="font-bold text-gray-900">Available Service Requests</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {availableRequests.map(req => (
              <div key={req.id} className="px-5 py-4 flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 text-sm">{req.serviceName}</div>
                  <div className="text-xs text-gray-500 mt-0.5 truncate">{req.description}</div>
                  {req.budget && <div className="text-xs text-violet-600 font-medium mt-0.5">Budget: PKR {req.budget.toLocaleString()}</div>}
                </div>
                <Button
                  size="sm"
                  onClick={() => handleBidRequest(req.id)}
                  disabled={bidding === req.id}
                  className="bg-violet-600 hover:bg-violet-700 text-white shrink-0 text-xs"
                >
                  {bidding === req.id ? '...' : 'Accept'}
                </Button>
              </div>
            ))}
            {availableRequests.length === 0 && (
              <div className="px-5 py-8 text-center text-gray-400 text-sm">No pending requests.</div>
            )}
          </div>
        </div>

        {/* Recent Completed */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-green-500" />
            <h2 className="font-bold text-gray-900">Recently Completed</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {completedOrders.slice(0, 5).map(order => (
              <div key={order.id} className="px-5 py-3 flex items-center gap-3">
                <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 truncate">{order.customerName}</div>
                  <div className="text-xs text-gray-400">PKR {order.total.toLocaleString()}</div>
                </div>
              </div>
            ))}
            {completedOrders.length === 0 && <div className="px-5 py-8 text-center text-gray-400 text-sm">No completed orders yet.</div>}
          </div>
        </div>
      </div>
    </div>
  )
}
