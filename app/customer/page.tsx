'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useEffect, useState } from 'react'
import { getOrdersByCustomer, getCustomerServiceRequests } from '@/lib/firestore'
import { Order, ServiceRequest } from '@/types'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ShoppingBag, Layers, ArrowRight, Package, Clock } from 'lucide-react'

const statusColors: Record<string, string> = {
  pending: 'bg-gray-100 text-gray-600',
  awaiting_bid: 'bg-yellow-100 text-yellow-700',
  in_progress: 'bg-blue-100 text-blue-700',
  quality_check: 'bg-purple-100 text-purple-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
  submitted: 'bg-yellow-100 text-yellow-700',
}

export default function CustomerDashboard() {
  const { user } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [requests, setRequests] = useState<ServiceRequest[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    const load = async () => {
      try {
        const [o, r] = await Promise.all([getOrdersByCustomer(user.uid), getCustomerServiceRequests(user.uid)])
        setOrders(o)
        setRequests(r)
      } catch {}
      setLoading(false)
    }
    load()
  }, [user])

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-violet-300 border-t-violet-600 rounded-full animate-spin" /></div>

  const activeOrders = orders.filter(o => ['awaiting_bid', 'in_progress', 'quality_check'].includes(o.status))
  const completedOrders = orders.filter(o => o.status === 'completed')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Welcome, {user?.name}!</h1>
        <p className="text-gray-500 text-sm">Track your orders and service requests</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Active Orders', value: activeOrders.length, icon: Clock, color: 'from-blue-500 to-indigo-600' },
          { label: 'Completed', value: completedOrders.length, icon: Package, color: 'from-green-500 to-teal-600' },
          { label: 'Service Requests', value: requests.length, icon: Layers, color: 'from-violet-500 to-purple-600' },
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

      <div className="flex gap-3 flex-wrap">
        <Link href="/products">
          <Button className="bg-violet-600 hover:bg-violet-700 text-white gap-2">
            <ShoppingBag className="w-4 h-4" /> Shop Products
          </Button>
        </Link>
        <Link href="/services">
          <Button variant="outline" className="gap-2">
            <Layers className="w-4 h-4" /> Request a Service
          </Button>
        </Link>
      </div>

      {activeOrders.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-blue-500" />
              <h2 className="font-bold text-gray-900">Active Orders</h2>
            </div>
            <Link href="/customer/orders">
              <span className="text-xs text-violet-600 hover:underline flex items-center gap-1">
                View all <ArrowRight className="w-3 h-3" />
              </span>
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {activeOrders.map(order => (
              <div key={order.id} className="px-5 py-4">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <div>
                    <div className="font-medium text-gray-900">{order.items.length} item(s)</div>
                    <div className="text-xs text-gray-400">PKR {order.total.toLocaleString()}</div>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[order.status]}`}>
                    {order.status.replace('_', ' ')}
                  </span>
                </div>
                {order.designerName && (
                  <div className="text-xs text-gray-500 mb-2">Designer: <strong>{order.designerName}</strong></div>
                )}
                {order.status === 'in_progress' && order.designerProgress !== undefined && (
                  <div>
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Design Progress</span>
                      <span className="font-semibold text-violet-600">{order.designerProgress}%</span>
                    </div>
                    <Progress value={order.designerProgress} className="h-1.5" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {requests.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
            <Layers className="w-4 h-4 text-violet-500" />
            <h2 className="font-bold text-gray-900">Recent Service Requests</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {requests.slice(0, 3).map(req => (
              <div key={req.id} className="px-5 py-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-medium text-gray-900 text-sm truncate">{req.serviceName}</div>
                  {req.designerName && <div className="text-xs text-gray-400">Designer: {req.designerName}</div>}
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${statusColors[req.status]}`}>
                  {req.status.replace('_', ' ')}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {orders.length === 0 && requests.length === 0 && (
        <div className="bg-white rounded-2xl p-10 text-center shadow-sm border border-gray-100">
          <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-gray-600 font-semibold mb-2">No orders yet</h3>
          <p className="text-gray-400 text-sm mb-4">Start shopping or request a design service!</p>
        </div>
      )}
    </div>
  )
}
