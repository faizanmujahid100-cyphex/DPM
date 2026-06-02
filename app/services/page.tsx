'use client'

import { useEffect, useState } from 'react'
import MainLayout from '@/components/layout/MainLayout'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import CloudImg from '@/components/ui/CloudImg'
import { useAuth } from '@/contexts/AuthContext'
import { getServices, createServiceRequest } from '@/lib/firestore'
import { Service } from '@/types'
import { Clock, CheckCircle, Package, Layers } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

export default function ServicesPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [activeService, setActiveService] = useState<Service | null>(null)
  const [desc, setDesc] = useState('')
  const [budget, setBudget] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    getServices().then(setServices).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const handleRequest = (service: Service) => {
    if (!user) { router.push('/auth/signin'); return }
    setActiveService(service)
    setDesc('')
    setBudget('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !activeService) return
    setSubmitting(true)
    try {
      await createServiceRequest({
        customerId: user.uid,
        customerName: user.name,
        customerEmail: user.email,
        serviceId: activeService.id,
        serviceName: activeService.name,
        description: desc,
        budget: budget ? Number(budget) : undefined,
        status: 'submitted',
      })
      toast.success('Request submitted! A designer will be assigned shortly.')
      setActiveService(null)
    } catch {
      toast.error('Failed to submit. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <MainLayout>
      <section className="py-16 bg-gradient-to-br from-violet-950 via-purple-900 to-slate-900 text-white">
        <div className="container mx-auto px-4 text-center">
          <Badge className="mb-4 bg-white/10 text-white border-white/20">Design Services</Badge>
          <h1 className="text-5xl font-extrabold mb-4">
            Our <span className="bg-gradient-to-r from-orange-400 to-pink-400 bg-clip-text text-transparent">Services</span>
          </h1>
          <p className="text-violet-200 text-lg max-w-xl mx-auto">
            Professional design and printing services. Submit a request and our expert designers will get to work.
          </p>
        </div>
      </section>

      <section className="py-8 bg-orange-50 border-b border-orange-100">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-8">
            {[{ icon: CheckCircle, text: 'Expert Designers' }, { icon: Clock, text: 'Fast Turnaround' }, { icon: Package, text: 'Unlimited Revisions' }].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-2 text-orange-700 font-medium">
                <Icon className="w-5 h-5 text-orange-500" />
                {text}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-50 min-h-[50vh]">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="flex justify-center py-24">
              <div className="w-8 h-8 border-2 border-violet-300 border-t-violet-600 rounded-full animate-spin" />
            </div>
          ) : services.length === 0 ? (
            <div className="text-center py-24 text-gray-400">
              <Layers className="w-16 h-16 mx-auto mb-4 opacity-30" />
              <p className="text-xl font-semibold text-gray-500">No services available yet</p>
              <p className="text-sm mt-2">Check back soon — services are being added.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map(service => (
                <div key={service.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col">
                  <div className="relative h-44 bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center">
                    <CloudImg
                      src={service.imageUrl}
                      alt={service.name}
                      className="w-full h-full object-cover"
                      fallback={<Layers className="w-16 h-16 text-white/50" />}
                    />
                    <div className="absolute bottom-3 left-3">
                      <span className="flex items-center gap-1 px-2 py-1 bg-black/40 backdrop-blur-sm text-white text-xs rounded-full">
                        <Clock className="w-3 h-3" /> {service.turnaround}
                      </span>
                    </div>
                  </div>
                  <div className="p-5 flex flex-col flex-1">
                    <h3 className="font-bold text-gray-900 mb-1">{service.name}</h3>
                    <p className="text-gray-500 text-sm leading-relaxed mb-4 flex-1 line-clamp-3">{service.description}</p>
                    <div className="pt-3 border-t border-gray-100">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <div className="text-xs text-gray-400">Starting from</div>
                          <div className="text-violet-700 font-bold text-xl">PKR {service.price.toLocaleString()}</div>
                        </div>
                      </div>
                      <Button onClick={() => handleRequest(service)} className="w-full bg-violet-600 hover:bg-violet-700 text-white">
                        Request Service
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <Dialog open={!!activeService} onOpenChange={o => !o && setActiveService(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Request: {activeService?.name}</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            {activeService && (
              <div className="p-3 bg-violet-50 rounded-xl text-sm text-violet-700">
                Starting from <strong>PKR {activeService.price.toLocaleString()}</strong> · Delivery: {activeService.turnaround}
              </div>
            )}
            <div className="space-y-1.5">
              <Label>Project Description *</Label>
              <Textarea placeholder="Describe your project in detail..." rows={4} required value={desc} onChange={e => setDesc(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Your Budget (PKR)</Label>
              <Input type="number" placeholder="Optional" value={budget} onChange={e => setBudget(e.target.value)} />
            </div>
            <Button type="submit" disabled={submitting} className="w-full bg-violet-600 hover:bg-violet-700 text-white">
              {submitting ? 'Submitting...' : 'Submit Request'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </MainLayout>
  )
}
