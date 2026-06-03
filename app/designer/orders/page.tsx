'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useEffect, useState } from 'react'
import { getDesignerOrders, updateOrderProgress, updateOrderStatus } from '@/lib/firestore'
import { Order, OrderStatus } from '@/types'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ShoppingBag, Save } from 'lucide-react'
import { toast } from 'sonner'

const statusColors: Record<string, string> = {
  in_progress: 'bg-blue-100 text-blue-700',
  quality_check: 'bg-purple-100 text-purple-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
}

function OrderProgressCard({ order, onUpdate }: { order: Order; onUpdate: () => void }) {
  const [progress, setProgress] = useState(order.designerProgress || 0)
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      await updateOrderProgress(order.id, progress)
      if (progress === 100) {
        await updateOrderStatus(order.id, 'quality_check')
        toast.success('Order marked as 100% — moved to quality check!')
      } else {
        toast.success('Progress updated!')
      }
      onUpdate()
    } catch {
      toast.error('Failed to update progress.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
          <ShoppingBag className="w-5 h-5 text-blue-600" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-bold text-gray-900">{order.customerName}</span>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[order.status] || 'bg-gray-100 text-gray-600'}`}>
              {order.status.replace('_', ' ')}
            </span>
          </div>
          <div className="text-sm text-gray-500">{order.items.length} item(s) · PKR {order.total.toLocaleString()}</div>
          {order.formData?.address && <div className="text-xs text-gray-400 mt-0.5">📍 {order.formData.address}</div>}
          {order.formData?.notes && <div className="text-xs text-gray-500 mt-0.5 italic">Note: {order.formData.notes}</div>}
        </div>
      </div>

      <div className="bg-gray-50 rounded-xl p-4 mb-4">
        <div className="text-sm font-semibold text-gray-700 mb-2">Order Items:</div>
        {order.items.map((item, i) => (
          <div key={i} className="flex justify-between text-sm text-gray-600 py-1 border-b border-gray-100 last:border-0">
            <span>{item.productName} x{item.quantity}</span>
            <span>PKR {(item.price * item.quantity).toLocaleString()}</span>
          </div>
        ))}
      </div>

      {order.status === 'in_progress' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-semibold">Completion Progress</Label>
            <span className="text-violet-600 font-bold text-lg">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
          <Input
            type="range"
            min="0"
            max="100"
            step="5"
            value={progress}
            onChange={e => setProgress(Number(e.target.value))}
            className="w-full accent-violet-600 h-2"
          />
          <Button
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-violet-600 hover:bg-violet-700 text-white gap-2"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : progress === 100 ? 'Mark Complete (100%)' : 'Update Progress'}
          </Button>
        </div>
      )}

      {order.status === 'quality_check' && (
        <div className="bg-purple-50 rounded-xl p-3 text-sm text-purple-700 text-center font-medium">
          Order is in quality check — waiting for admin review.
        </div>
      )}
      {order.status === 'completed' && (
        <div className="bg-green-50 rounded-xl p-3 text-sm text-green-700 text-center font-medium">
          ✓ Order completed successfully!
        </div>
      )}
    </div>
  )
}

export default function DesignerOrdersPage() {
  const { user } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')

  const load = async () => {
    if (!user) return
    try { setOrders(await getDesignerOrders(user.uid)) } catch {}
    setLoading(false)
  }

  useEffect(() => { load() }, [user])

  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter)

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-orange-300 border-t-orange-600 rounded-full animate-spin" /></div>

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>

      <div className="flex flex-wrap gap-2">
        {['all', 'in_progress', 'quality_check', 'completed'].map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all capitalize ${filter === s ? 'bg-violet-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-violet-300'}`}
          >
            {s.replace('_', ' ')} {s === 'all' ? `(${orders.length})` : `(${orders.filter(o => o.status === s).length})`}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {filtered.map(order => (
          <OrderProgressCard key={order.id} order={order} onUpdate={load} />
        ))}
        {filtered.length === 0 && (
          <div className="bg-white rounded-2xl p-10 text-center text-gray-400 shadow-sm border border-gray-100">
            {filter === 'all' ? "You haven't accepted any orders yet. Go to Dashboard to find available orders!" : `No ${filter.replace('_', ' ')} orders.`}
          </div>
        )}
      </div>
    </div>
  )
}
