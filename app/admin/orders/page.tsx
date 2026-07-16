'use client'

import { useEffect, useState } from 'react'
import { getAllOrders, getAllDesigners, updateOrderStatus, reassignOrder, addOrderPayment } from '@/lib/firestore'
import { Order, User, OrderStatus } from '@/types'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ShoppingBag, RefreshCw, User as UserIcon, Wallet, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'

const statusColors: Record<string, string> = {
  pending: 'bg-gray-100 text-gray-600',
  awaiting_bid: 'bg-yellow-100 text-yellow-700',
  in_progress: 'bg-blue-100 text-blue-700',
  quality_check: 'bg-purple-100 text-purple-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
}

const paymentColors: Record<string, string> = {
  unpaid: 'bg-red-100 text-red-600',
  partial: 'bg-orange-100 text-orange-700',
  paid: 'bg-green-100 text-green-700',
}

const statusOptions: OrderStatus[] = ['awaiting_bid', 'in_progress', 'quality_check', 'completed', 'cancelled']

export default function AdminOrdersPage() {
  const { user } = useAuth()
  const isSuperAdmin = user?.role === 'superadmin'

  const [orders, setOrders] = useState<Order[]>([])
  const [designers, setDesigners] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [reassignOrder_state, setReassignOrder] = useState<Order | null>(null)
  const [selectedDesigner, setSelectedDesigner] = useState('')
  const [reassigning, setReassigning] = useState(false)

  // payment dialog (superadmin)
  const [paymentOrder, setPaymentOrder] = useState<Order | null>(null)
  const [payAmount, setPayAmount] = useState('')
  const [payNote, setPayNote] = useState('')
  const [savingPayment, setSavingPayment] = useState(false)

  const load = async () => {
    try {
      const [o, d] = await Promise.all([getAllOrders(), getAllDesigners()])
      setOrders(o)
      setDesigners(d)
      return o
    } catch {}
    setLoading(false)
    return [] as Order[]
  }

  useEffect(() => { load().finally(() => setLoading(false)) }, [])

  const recordPayment = async (order: Order, amount: number) => {
    if (!user) return
    if (amount <= 0) { toast.error('Enter an amount greater than 0.'); return }
    const remaining = order.total - (order.amountPaid ?? 0)
    if (amount > remaining) {
      toast.error(`Amount exceeds remaining balance (PKR ${remaining.toLocaleString()}).`)
      return
    }
    setSavingPayment(true)
    try {
      await addOrderPayment(order.id, {
        amount,
        note: payNote.trim() || undefined,
        addedBy: user.uid,
        addedByName: user.name,
      })
      toast.success(`PKR ${amount.toLocaleString()} recorded.`)
      setPayAmount('')
      setPayNote('')
      const fresh = await load()
      setPaymentOrder(fresh.find(o => o.id === order.id) ?? null)
    } catch {
      toast.error('Failed to record payment.')
    } finally {
      setSavingPayment(false)
    }
  }

  const handleStatusChange = async (orderId: string, status: OrderStatus) => {
    try {
      await updateOrderStatus(orderId, status)
      toast.success('Order status updated.')
      load()
    } catch {
      toast.error('Failed to update status.')
    }
  }

  const handleReassign = async () => {
    if (!reassignOrder_state || !selectedDesigner) return
    const designer = designers.find(d => d.uid === selectedDesigner)
    if (!designer) return
    setReassigning(true)
    try {
      await reassignOrder(reassignOrder_state.id, designer.uid, designer.name)
      toast.success(`Order reassigned to ${designer.name}`)
      setReassignOrder(null)
      setSelectedDesigner('')
      load()
    } catch {
      toast.error('Failed to reassign order.')
    } finally {
      setReassigning(false)
    }
  }

  const filtered = statusFilter === 'all' ? orders : orders.filter(o => o.status === statusFilter)

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-violet-300 border-t-violet-600 rounded-full animate-spin" /></div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-gray-900">All Orders</h1>
        <div className="flex gap-2 flex-wrap">
          {['all', 'awaiting_bid', 'in_progress', 'completed', 'cancelled'].map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all capitalize ${statusFilter === s ? 'bg-violet-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-violet-300'}`}
            >
              {s.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {filtered.map(order => (
          <div key={order.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="flex flex-wrap items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center shrink-0">
                <ShoppingBag className="w-5 h-5 text-violet-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="font-bold text-gray-900">{order.customerName}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[order.status]}`}>
                    {order.status.replace('_', ' ')}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${paymentColors[order.paymentStatus ?? 'unpaid']}`}>
                    {order.paymentStatus === 'paid' ? 'Paid' : order.paymentStatus === 'partial' ? `Partial · PKR ${(order.amountPaid ?? 0).toLocaleString()}/${order.total.toLocaleString()}` : 'Unpaid'}
                  </span>
                </div>
                <div className="text-sm text-gray-500 mb-1">
                  {order.items.length} item(s) · PKR {order.total.toLocaleString()} · Payment ID: <span className="font-mono font-semibold text-gray-700">#{order.id.slice(-8).toUpperCase()}</span>
                </div>
                {order.designerName && (
                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <UserIcon className="w-3 h-3" />
                    Designer: <strong>{order.designerName}</strong>
                    {order.designerProgress !== undefined && (
                      <span className="ml-2 text-violet-600 font-semibold">{order.designerProgress}% complete</span>
                    )}
                  </div>
                )}
                {order.designerProgress !== undefined && order.status === 'in_progress' && (
                  <div className="mt-2 max-w-xs">
                    <Progress value={order.designerProgress} className="h-1.5" />
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <Select value={order.status} onValueChange={(v) => { if (typeof v === 'string') handleStatusChange(order.id, v as OrderStatus) }}>
                  <SelectTrigger className="w-36 h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {statusOptions.map(s => (
                      <SelectItem key={s} value={s} className="text-xs capitalize">{s.replace('_', ' ')}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 text-xs"
                  onClick={() => { setReassignOrder(order); setSelectedDesigner('') }}
                >
                  <RefreshCw className="w-3 h-3" /> Reassign
                </Button>
                {isSuperAdmin && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5 text-xs text-violet-700 border-violet-200 hover:bg-violet-50"
                    onClick={() => { setPaymentOrder(order); setPayAmount(''); setPayNote('') }}
                  >
                    <Wallet className="w-3 h-3" /> Payment
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="bg-white rounded-2xl p-10 text-center text-gray-400 shadow-sm border border-gray-100">
            No orders found.
          </div>
        )}
      </div>

      <Dialog open={!!reassignOrder_state} onOpenChange={o => !o && setReassignOrder(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Reassign Order</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <p className="text-sm text-gray-500">Customer: <strong>{reassignOrder_state?.customerName}</strong></p>
            <Select onValueChange={(v) => { if (typeof v === 'string') setSelectedDesigner(v) }}>
              <SelectTrigger><SelectValue placeholder="Select designer" /></SelectTrigger>
              <SelectContent>
                {designers.map(d => (
                  <SelectItem key={d.uid} value={d.uid}>{d.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              onClick={handleReassign}
              disabled={reassigning || !selectedDesigner}
              className="w-full bg-violet-600 hover:bg-violet-700 text-white"
            >
              {reassigning ? 'Reassigning...' : 'Reassign'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Payment dialog (superadmin) ── */}
      <Dialog open={!!paymentOrder} onOpenChange={o => !o && setPaymentOrder(null)}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wallet className="w-5 h-5 text-violet-600" /> Order Payment
            </DialogTitle>
          </DialogHeader>
          {paymentOrder && (() => {
            const paid = paymentOrder.amountPaid ?? 0
            const remaining = Math.max(0, paymentOrder.total - paid)
            return (
              <div className="space-y-4 mt-2">
                <div className="p-3.5 bg-gray-50 rounded-xl text-sm space-y-1">
                  <div className="flex justify-between"><span className="text-gray-500">Customer</span><span className="font-semibold text-gray-800">{paymentOrder.customerName}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Payment ID</span><span className="font-mono font-bold text-violet-700">#{paymentOrder.id.slice(-8).toUpperCase()}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Total</span><span className="font-semibold text-gray-800">PKR {paymentOrder.total.toLocaleString()}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Paid</span><span className="font-semibold text-green-600">PKR {paid.toLocaleString()}</span></div>
                  <div className="flex justify-between border-t border-gray-200 pt-1 mt-1"><span className="text-gray-500">Remaining</span><span className={`font-bold ${remaining > 0 ? 'text-orange-600' : 'text-green-600'}`}>PKR {remaining.toLocaleString()}</span></div>
                </div>

                {remaining === 0 ? (
                  <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700 font-semibold">
                    <CheckCircle2 className="w-4 h-4" /> This order is fully paid.
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <Label>Amount Received (PKR)</Label>
                      <Input
                        type="number"
                        min={1}
                        max={remaining}
                        placeholder={`Up to ${remaining.toLocaleString()}`}
                        value={payAmount}
                        onChange={e => setPayAmount(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Note (optional)</Label>
                      <Input
                        placeholder="e.g. JazzCash TRX ID, screenshot verified"
                        value={payNote}
                        onChange={e => setPayNote(e.target.value)}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => recordPayment(paymentOrder, Number(payAmount))}
                        disabled={savingPayment || !payAmount}
                        className="flex-1 bg-violet-600 hover:bg-violet-700 text-white gap-1.5"
                      >
                        <Wallet className="w-4 h-4" />
                        {savingPayment ? 'Saving...' : 'Add Payment'}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => recordPayment(paymentOrder, remaining)}
                        disabled={savingPayment}
                        className="flex-1 gap-1.5 text-green-700 border-green-200 hover:bg-green-50"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        Mark Fully Paid
                      </Button>
                    </div>
                  </div>
                )}

                {(paymentOrder.payments?.length ?? 0) > 0 && (
                  <div>
                    <div className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Payment History</div>
                    <div className="space-y-1.5 max-h-48 overflow-y-auto">
                      {paymentOrder.payments!.map((p, i) => (
                        <div key={i} className="flex items-start justify-between gap-3 p-2.5 bg-gray-50 rounded-lg text-xs">
                          <div className="min-w-0">
                            <div className="font-bold text-gray-800">PKR {p.amount.toLocaleString()}</div>
                            <div className="text-gray-400">
                              by {p.addedByName}
                              {p.date?.toDate ? ` · ${p.date.toDate().toLocaleDateString()}` : ''}
                            </div>
                            {p.note && <div className="text-gray-500 mt-0.5">{p.note}</div>}
                          </div>
                          <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )
          })()}
        </DialogContent>
      </Dialog>
    </div>
  )
}
