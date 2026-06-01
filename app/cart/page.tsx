'use client'

import MainLayout from '@/components/layout/MainLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { useCart } from '@/contexts/CartContext'
import { useAuth } from '@/contexts/AuthContext'
import { createOrder } from '@/lib/firestore'
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

export default function CartPage() {
  const { items, removeItem, updateQuantity, clearCart, total } = useCart()
  const { user } = useAuth()
  const router = useRouter()
  const [address, setAddress] = useState('')
  const [notes, setNotes] = useState('')
  const [placing, setPlacing] = useState(false)

  const handlePlaceOrder = async () => {
    if (!user) { router.push('/auth/signin'); return }
    if (items.length === 0) { toast.error('Your cart is empty.'); return }
    setPlacing(true)
    try {
      const orderId = await createOrder({
        customerId: user.uid,
        customerName: user.name,
        customerEmail: user.email,
        items,
        total,
        status: 'awaiting_bid',
        shippingAddress: address,
        notes,
      })
      clearCart()
      toast.success('Order placed! A designer will be assigned soon.')
      router.push('/customer/orders')
    } catch {
      toast.error('Failed to place order. Please try again.')
    } finally {
      setPlacing(false)
    }
  }

  if (items.length === 0) {
    return (
      <MainLayout>
        <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 py-20">
          <div className="w-24 h-24 rounded-full bg-violet-100 flex items-center justify-center">
            <ShoppingBag className="w-12 h-12 text-violet-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Your cart is empty</h2>
          <p className="text-gray-500">Add some products to get started.</p>
          <Link href="/products">
            <Button className="bg-violet-600 hover:bg-violet-700 text-white mt-2">
              Browse Products <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <section className="py-12 bg-gray-50 min-h-[70vh]">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {items.map(item => (
                <div key={item.productId} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shrink-0">
                    <ShoppingBag className="w-8 h-8 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900">{item.productName}</h3>
                    <p className="text-violet-700 font-bold">PKR {item.price.toLocaleString()}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" className="w-8 h-8" onClick={() => updateQuantity(item.productId, item.quantity - 1)}>
                      <Minus className="w-3 h-3" />
                    </Button>
                    <span className="w-8 text-center font-semibold">{item.quantity}</span>
                    <Button variant="outline" size="icon" className="w-8 h-8" onClick={() => updateQuantity(item.productId, item.quantity + 1)}>
                      <Plus className="w-3 h-3" />
                    </Button>
                  </div>
                  <div className="text-right min-w-[80px]">
                    <p className="font-bold text-gray-900">PKR {(item.price * item.quantity).toLocaleString()}</p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => removeItem(item.productId)} className="text-red-400 hover:text-red-600 hover:bg-red-50">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>

            <div className="space-y-4">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h2>
                <div className="space-y-2 mb-4">
                  {items.map(item => (
                    <div key={item.productId} className="flex justify-between text-sm text-gray-600">
                      <span>{item.productName} x{item.quantity}</span>
                      <span>PKR {(item.price * item.quantity).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
                <Separator className="my-4" />
                <div className="flex justify-between font-bold text-lg text-gray-900">
                  <span>Total</span>
                  <span className="text-violet-700">PKR {total.toLocaleString()}</span>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4">
                <h2 className="text-lg font-bold text-gray-900">Delivery Details</h2>
                <div className="space-y-1.5">
                  <Label>Shipping Address</Label>
                  <Input placeholder="Your full address" value={address} onChange={e => setAddress(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label>Order Notes</Label>
                  <Input placeholder="Special instructions..." value={notes} onChange={e => setNotes(e.target.value)} />
                </div>
                <Button
                  onClick={handlePlaceOrder}
                  disabled={placing}
                  className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white py-5 font-semibold shadow-lg"
                >
                  {placing ? 'Placing Order...' : 'Place Order'}
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
                {!user && (
                  <p className="text-center text-xs text-gray-500">
                    <Link href="/auth/signin" className="text-violet-600 font-medium">Sign in</Link> to place your order
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  )
}
