'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useEffect, useState } from 'react'
import { getOrdersByCustomer } from '@/lib/firestore'
import { Order } from '@/types'
import { Progress } from '@/components/ui/progress'
import { ShoppingBag, MapPin, FileText, User } from 'lucide-react'

const statusColors: Record<string, string> = {
  awaiting_bid: 'bg-yellow-100 text-yellow-700',
  in_progress: 'bg-blue-100 text-blue-700',
  quality_check: 'bg-purple-100 text-purple-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
}

const statusSteps = ['awaiting_bid', 'in_progress', 'quality_check', 'completed']

export default function CustomerOrdersPage() {
  const { user } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    getOrdersByCustomer(user.uid).then(setOrders).catch(() => {}).finally(() => setLoading(false))
  }, [user])

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-violet-300 border-t-violet-600 rounded-full animate-spin" /></div>

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>

      <div className="space-y-5">
        {orders.map(order => (
          <div key={order.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-5 py-4 bg-gray-50 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <ShoppingBag className="w-5 h-5 text-violet-600" />
                <div>
                  <div className="font-bold text-gray-900 text-sm">Order #{order.id.slice(-8).toUpperCase()}</div>
                  <div className="text-xs text-gray-400">{order.items.length} item(s) · PKR {order.total.toLocaleString()}</div>
                </div>
              </div>
              <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${statusColors[order.status] || 'bg-gray-100 text-gray-600'}`}>
                {order.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </span>
            </div>

            <div className="p-5">
              {/* Progress Steps */}
              {order.status !== 'cancelled' && (
                <div className="mb-5">
                  <div className="flex items-center gap-0">
                    {statusSteps.map((step, i) => {
                      const currentIdx = statusSteps.indexOf(order.status)
                      const isPassed = i <= currentIdx
                      return (
                        <div key={step} className="flex items-center flex-1 last:flex-none">
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${isPassed ? 'bg-violet-600 text-white' : 'bg-gray-200 text-gray-400'}`}>
                            {i + 1}
                          </div>
                          {i < statusSteps.length - 1 && (
                            <div className={`flex-1 h-0.5 mx-1 ${i < currentIdx ? 'bg-violet-600' : 'bg-gray-200'}`} />
                          )}
                        </div>
                      )
                    })}
                  </div>
                  <div className="flex justify-between mt-1">
                    {['Awaiting Designer', 'In Progress', 'Quality Check', 'Completed'].map(label => (
                      <div key={label} className="text-xs text-gray-400 text-center" style={{ width: `${100 / statusSteps.length}%` }}>{label}</div>
                    ))}
                  </div>
                </div>
              )}

              {/* Designer progress */}
              {order.status === 'in_progress' && order.designerProgress !== undefined && (
                <div className="mb-4 p-3 bg-blue-50 rounded-xl">
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="text-blue-700 font-medium">Designer working...</span>
                    <span className="text-blue-700 font-bold">{order.designerProgress}%</span>
                  </div>
                  <Progress value={order.designerProgress} className="h-2" />
                </div>
              )}

              {/* Order items */}
              <div className="space-y-1.5 mb-4">
                {order.items.map((item, i) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span className="text-gray-700">{item.productName} <span className="text-gray-400">×{item.quantity}</span></span>
                    <span className="text-gray-700 font-medium">PKR {(item.price * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
                <div className="flex justify-between text-sm font-bold pt-2 border-t border-gray-100">
                  <span>Total</span>
                  <span className="text-violet-700">PKR {order.total.toLocaleString()}</span>
                </div>
              </div>

              {/* Meta */}
              <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                {order.designerName && (
                  <div className="flex items-center gap-1">
                    <User className="w-3 h-3" />
                    Designer: <strong className="text-gray-700">{order.designerName}</strong>
                  </div>
                )}
                {order.shippingAddress && (
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {order.shippingAddress}
                  </div>
                )}
                {order.notes && (
                  <div className="flex items-center gap-1">
                    <FileText className="w-3 h-3" />
                    {order.notes}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {orders.length === 0 && (
          <div className="bg-white rounded-2xl p-10 text-center shadow-sm border border-gray-100">
            <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-gray-600 font-semibold mb-2">No orders yet</h3>
            <p className="text-gray-400 text-sm">Place your first order from our products page!</p>
          </div>
        )}
      </div>
    </div>
  )
}
