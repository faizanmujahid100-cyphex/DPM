'use client'

import { useEffect, useState } from 'react'
import MainLayout from '@/components/layout/MainLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { useCart } from '@/contexts/CartContext'
import { useAuth } from '@/contexts/AuthContext'
import { createOrder, getOrderFormFields, getActivePaymentMethods, getPaymentSettings } from '@/lib/firestore'
import { OrderFormField, PaymentMethod, PaymentSettings } from '@/types'
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, AlertCircle, Wallet, Copy, MessageCircle, Mail } from 'lucide-react'
import Link from 'next/link'
import { useState as useLocalState } from 'react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

export default function CartPage() {
  const { items, removeItem, updateQuantity, clearCart, total } = useCart()
  const { user, needsProfileComplete } = useAuth()
  const router = useRouter()

  const [formFields, setFormFields] = useState<OrderFormField[]>([])
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({})
  const [placing, setPlacing] = useState(false)
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings | null>(null)

  useEffect(() => {
    getActivePaymentMethods().then(setPaymentMethods).catch(() => {})
    getPaymentSettings().then(setPaymentSettings).catch(() => {})
  }, [])

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
      .then(() => toast.success('Copied to clipboard!'))
      .catch(() => toast.error('Failed to copy.'))
  }

  useEffect(() => {
    getOrderFormFields().then(fields => {
      const active = fields.filter(f => f.active)
      setFormFields(active)
      // Auto-fill from user profile
      if (user) {
        const profileData: Record<string, string> = {
          name: user.name || '',
          email: user.email || '',
          phone: user.phone || '',
          whatsapp: user.whatsapp || '',
          fatherName: user.fatherName || '',
          address: user.address || '',
        }
        const prefilled: Record<string, string> = {}
        active.forEach(f => {
          if (f.autoFillKey && profileData[f.autoFillKey]) {
            prefilled[f.key] = profileData[f.autoFillKey]
          }
        })
        setFieldValues(prefilled)
      }
    }).catch(() => {})
  }, [user])

  const handleFieldChange = (key: string, value: string) => {
    setFieldValues(prev => ({ ...prev, [key]: value }))
  }

  const validate = () => {
    for (const field of formFields) {
      if (!field.active) continue
      const val = (fieldValues[field.key] || '').trim()
      if (field.required && !val) {
        toast.error(`"${field.label}" is required.`)
        return false
      }
      if (val && field.minLength && val.length < field.minLength) {
        toast.error(`"${field.label}" must be at least ${field.minLength} characters.`)
        return false
      }
      if (val && field.maxLength && val.length > field.maxLength) {
        toast.error(`"${field.label}" must be at most ${field.maxLength} characters.`)
        return false
      }
    }
    return true
  }

  const handlePlaceOrder = async () => {
    if (!user) { router.push('/auth/signin'); return }
    if (needsProfileComplete) { router.push('/auth/complete-profile'); return }
    if (items.length === 0) { toast.error('Your cart is empty.'); return }
    if (!validate()) return

    setPlacing(true)
    try {
      const orderId = await createOrder({
        customerId: user.uid,
        customerName: fieldValues['name'] || user.name,
        customerEmail: fieldValues['email'] || user.email,
        items,
        total,
        status: 'awaiting_bid',
        formData: fieldValues,
      })
      clearCart()
      toast.success(`Order placed! Your Payment ID is #${orderId.slice(-8).toUpperCase()} — send your payment screenshot with this ID.`, { duration: 10000 })
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

          {/* Profile incomplete banner */}
          {user && needsProfileComplete && (
            <div className="mb-6 flex items-center gap-3 p-4 bg-orange-50 border border-orange-200 rounded-xl text-sm text-orange-700">
              <AlertCircle className="w-5 h-5 shrink-0 text-orange-500" />
              <span>Please <Link href="/auth/complete-profile" className="underline font-semibold">complete your profile</Link> before placing an order. We need your phone and address details.</span>
            </div>
          )}

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart items */}
            <div className="lg:col-span-2 space-y-4">
              {items.map(item => (
                <div key={item.productId} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shrink-0">
                    {item.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.imageUrl} alt={item.productName} className="w-full h-full object-cover rounded-xl" />
                    ) : (
                      <ShoppingBag className="w-8 h-8 text-white" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">{item.productName}</h3>
                    <p className="text-violet-700 font-bold">PKR {item.price.toLocaleString()}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => updateQuantity(item.productId, item.quantity - 1)} className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50">
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-8 text-center font-semibold text-sm">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.productId, item.quantity + 1)} className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50">
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="text-right min-w-[80px]">
                    <p className="font-bold text-gray-900">PKR {(item.price * item.quantity).toLocaleString()}</p>
                  </div>
                  <button onClick={() => removeItem(item.productId)} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Order form + summary */}
            <div className="space-y-4">
              {/* Order summary */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h2>
                <div className="space-y-2 mb-4">
                  {items.map(item => (
                    <div key={item.productId} className="flex justify-between text-sm text-gray-600">
                      <span>{item.productName} ×{item.quantity}</span>
                      <span>PKR {(item.price * item.quantity).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
                <Separator className="my-3" />
                <div className="flex justify-between font-bold text-lg text-gray-900">
                  <span>Total</span>
                  <span className="text-violet-700">PKR {total.toLocaleString()}</span>
                </div>
              </div>

              {/* Payment methods */}
              {paymentMethods.length > 0 && (
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <h2 className="text-lg font-bold text-gray-900 mb-1 flex items-center gap-2">
                    <Wallet className="w-5 h-5 text-violet-600" /> Payment Methods
                  </h2>
                  <p className="text-gray-400 text-xs mb-4">Pay using any method below, then send us your payment screenshot.</p>

                  <div className="space-y-3">
                    {paymentMethods.map(m => (
                      <div key={m.id} className="p-3.5 bg-gray-50 rounded-xl border border-gray-100">
                        <div className="font-bold text-gray-900 text-sm mb-1">{m.name}</div>
                        {m.accountName && (
                          <div className="text-xs text-gray-500 mb-0.5">Account: <span className="font-semibold text-gray-700">{m.accountName}</span></div>
                        )}
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-mono font-bold text-violet-700">{m.accountNumber}</span>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(m.accountNumber)}
                            className="p-1 text-gray-400 hover:text-violet-600 hover:bg-violet-50 rounded transition-colors"
                            title="Copy number"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        {m.instructions && <p className="text-xs text-gray-400 mt-1">{m.instructions}</p>}
                        {m.qrCodeUrl && (
                          <div className="mt-2">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={m.qrCodeUrl} alt={`${m.name} QR code`} className="w-32 h-32 rounded-lg border border-gray-200 object-contain bg-white" />
                            <p className="text-[11px] text-gray-400 mt-1">Scan to pay</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {paymentSettings && (paymentSettings.whatsapp || paymentSettings.email) && (
                    <div className="mt-4 p-3.5 bg-violet-50 rounded-xl border border-violet-100 text-xs text-violet-800 space-y-2">
                      <p className="font-semibold">{paymentSettings.instructions || 'After paying, send a screenshot of your payment along with your Payment ID so we can verify it.'}</p>
                      <p className="text-violet-600">Your Payment ID will be shown after you place the order (also in My Orders).</p>
                      <div className="flex flex-col gap-1.5 pt-1">
                        {paymentSettings.whatsapp && (
                          <a
                            href={`https://wa.me/${paymentSettings.whatsapp.replace(/\D/g, '').replace(/^0/, '92')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 font-semibold text-green-700 hover:underline"
                          >
                            <MessageCircle className="w-3.5 h-3.5" /> WhatsApp: {paymentSettings.whatsapp}
                          </a>
                        )}
                        {paymentSettings.email && (
                          <a href={`mailto:${paymentSettings.email}`} className="flex items-center gap-1.5 font-semibold text-violet-700 hover:underline">
                            <Mail className="w-3.5 h-3.5" /> Email: {paymentSettings.email}
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Dynamic order form */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-lg font-bold text-gray-900 mb-1">Order Details</h2>
                <p className="text-gray-400 text-xs mb-5">Fields marked with * are required</p>

                <div className="space-y-4">
                  {formFields.map(field => (
                    <DynamicField
                      key={field.id}
                      field={field}
                      value={fieldValues[field.key] || ''}
                      onChange={val => handleFieldChange(field.key, val)}
                    />
                  ))}
                </div>

                <Button
                  onClick={handlePlaceOrder}
                  disabled={placing || (user ? needsProfileComplete : false)}
                  className="w-full mt-5 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white py-5 font-semibold shadow-lg"
                >
                  {placing ? 'Placing Order...' : 'Place Order'}
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>

                {!user && (
                  <p className="text-center text-xs text-gray-500 mt-3">
                    <Link href="/auth/signin" className="text-violet-600 font-medium">Sign in</Link> to auto-fill your details
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

// ── Dynamic Field Renderer ────────────────────────────────────────────────────

function DynamicField({ field, value, onChange }: {
  field: OrderFormField
  value: string
  onChange: (val: string) => void
}) {
  const hint = [
    field.minLength && field.maxLength && field.minLength === field.maxLength
      ? `${field.minLength} characters required`
      : [field.minLength && `min ${field.minLength}`, field.maxLength && `max ${field.maxLength}`].filter(Boolean).join(', ') + (field.minLength || field.maxLength ? ' characters' : ''),
  ].filter(Boolean).join(' · ')

  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
        {field.label}
        {field.required && <span className="text-red-500">*</span>}
        {field.autoFillKey && value && (
          <span className="text-xs text-violet-500 font-normal">(from profile)</span>
        )}
      </Label>

      {field.type === 'textarea' ? (
        <Textarea
          placeholder={field.placeholder}
          rows={3}
          value={value}
          onChange={e => onChange(e.target.value)}
          maxLength={field.maxLength}
        />
      ) : field.type === 'select' ? (
        <Select value={value} onValueChange={v => v && onChange(v)}>
          <SelectTrigger><SelectValue placeholder={field.placeholder || 'Select...'} /></SelectTrigger>
          <SelectContent>
            {field.options?.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
          </SelectContent>
        </Select>
      ) : (
        <Input
          type={field.type}
          placeholder={field.placeholder}
          value={value}
          onChange={e => {
            let val = e.target.value
            if (field.type === 'tel') val = val.replace(/\D/g, '')
            onChange(val)
          }}
          maxLength={field.maxLength}
          minLength={field.minLength}
        />
      )}

      {hint && <p className="text-xs text-gray-400">{hint}</p>}
    </div>
  )
}
