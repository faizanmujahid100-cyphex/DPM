'use client'

import { useEffect, useState } from 'react'
import { getAllOrders, getAllUsers, getProducts, getAllServices, getAllServiceRequests } from '@/lib/firestore'
import { Order, User, ServiceRequest } from '@/types'
import { ShoppingBag, Users, Package, Layers, TrendingUp, Clock, CheckCircle, AlertCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

const statusColors: Record<string, string> = {
  pending: 'bg-gray-100 text-gray-600',
  awaiting_bid: 'bg-yellow-100 text-yellow-700',
  in_progress: 'bg-blue-100 text-blue-700',
  quality_check: 'bg-purple-100 text-purple-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
}

export default function AdminDashboard() {
  const [orders, setOrders] = useState<Order[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [productCount, setProductCount] = useState(0)
  const [serviceCount, setServiceCount] = useState(0)
  const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const [o, u, p, s, sr] = await Promise.all([
          getAllOrders(),
          getAllUsers(),
          getProducts(),
          getAllServices(),
          getAllServiceRequests(),
        ])
        setOrders(o)
        setUsers(u)
        setProductCount(p.length)
        setServiceCount(s.length)
        setServiceRequests(sr)
      } catch {}
      setLoading(false)
    }
    load()
  }, [])

  const stats = [
    { label: 'Total Orders', value: orders.length, icon: ShoppingBag, color: 'from-violet-500 to-purple-600', sub: `${orders.filter(o => o.status === 'awaiting_bid').length} awaiting designer` },
    { label: 'Total Users', value: users.length, icon: Users, color: 'from-orange-500 to-pink-500', sub: `${users.filter(u => u.role === 'designer').length} designers` },
    { label: 'Products', value: productCount, icon: Package, color: 'from-green-500 to-teal-600', sub: 'In catalogue' },
    { label: 'Service Requests', value: serviceRequests.length, icon: Layers, color: 'from-blue-500 to-indigo-600', sub: `${serviceRequests.filter(s => s.status === 'submitted').length} pending` },
  ]

  const revenue = orders.filter(o => o.status === 'completed').reduce((sum, o) => sum + o.total, 0)

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-violet-300 border-t-violet-600 rounded-full animate-spin" /></div>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm">Welcome back! Here&apos;s an overview of DPM Printing Center.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {stats.map(({ label, value, icon: Icon, color, sub }) => (
          <div key={label} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <TrendingUp className="w-4 h-4 text-green-500" />
            </div>
            <div className="text-3xl font-extrabold text-gray-900 mb-0.5">{value}</div>
            <div className="text-sm font-medium text-gray-700">{label}</div>
            <div className="text-xs text-gray-400 mt-0.5">{sub}</div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <div className="flex items-center gap-2 mb-1">
          <TrendingUp className="w-5 h-5 text-green-500" />
          <span className="font-bold text-gray-900">Completed Revenue</span>
        </div>
        <div className="text-4xl font-extrabold text-violet-700">PKR {revenue.toLocaleString()}</div>
        <div className="text-xs text-gray-400 mt-1">From {orders.filter(o => o.status === 'completed').length} completed orders</div>
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-violet-600" />
            <h2 className="font-bold text-gray-900">Recent Orders</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {orders.slice(0, 6).map(order => (
              <div key={order.id} className="px-5 py-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-medium text-gray-900 text-sm truncate">{order.customerName}</div>
                  <div className="text-xs text-gray-400">PKR {order.total.toLocaleString()}</div>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${statusColors[order.status]}`}>
                  {order.status.replace('_', ' ')}
                </span>
              </div>
            ))}
            {orders.length === 0 && <div className="px-5 py-8 text-center text-gray-400 text-sm">No orders yet</div>}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-orange-500" />
            <h2 className="font-bold text-gray-900">Orders Awaiting Designer</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {orders.filter(o => o.status === 'awaiting_bid').slice(0, 6).map(order => (
              <div key={order.id} className="px-5 py-3">
                <div className="font-medium text-gray-900 text-sm">{order.customerName}</div>
                <div className="text-xs text-gray-400">{order.items.length} item(s) · PKR {order.total.toLocaleString()}</div>
              </div>
            ))}
            {orders.filter(o => o.status === 'awaiting_bid').length === 0 && (
              <div className="px-5 py-8 text-center text-gray-400 text-sm flex flex-col items-center gap-2">
                <CheckCircle className="w-6 h-6 text-green-400" />
                All orders assigned!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
