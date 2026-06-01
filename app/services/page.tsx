'use client'

import MainLayout from '@/components/layout/MainLayout'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useAuth } from '@/contexts/AuthContext'
import { createServiceRequest } from '@/lib/firestore'
import { PenTool, Type, FileText, Layers, Camera, Globe, Printer, Palette, Package, Clock, CheckCircle } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

const services = [
  { id: 's1', name: 'Logo & Brand Design', desc: 'Professional logos, brand identity, business card design, letterheads and complete brand kits.', price: 1500, turnaround: '2–3 days', icon: PenTool, color: 'from-violet-500 to-purple-600' },
  { id: 's2', name: 'Typing & Data Entry', desc: 'Fast and accurate typing of documents, applications, CVs, forms and official letters.', price: 200, turnaround: 'Same day', icon: Type, color: 'from-orange-500 to-amber-500' },
  { id: 's3', name: 'Certificate Design', desc: 'Custom certificate and award designs for schools, organizations and corporate events.', price: 800, turnaround: '1–2 days', icon: FileText, color: 'from-green-500 to-teal-600' },
  { id: 's4', name: 'Brochure & Flyer Design', desc: 'Eye-catching brochures, flyers and marketing materials for your business promotion.', price: 600, turnaround: '1–2 days', icon: Layers, color: 'from-blue-500 to-indigo-600' },
  { id: 's5', name: 'Photo Editing', desc: 'Professional background removal, retouching, color correction and photo manipulation.', price: 300, turnaround: 'Same day', icon: Camera, color: 'from-pink-500 to-rose-600' },
  { id: 's6', name: 'Social Media Design', desc: 'Custom posts, stories, cover photos and ad banners for all social media platforms.', price: 500, turnaround: '1 day', icon: Globe, color: 'from-yellow-500 to-orange-500' },
  { id: 's7', name: 'Banner & Signage Design', desc: 'Professional banner, standee and signage designs for events and advertising.', price: 700, turnaround: '1–2 days', icon: Printer, color: 'from-red-500 to-pink-600' },
  { id: 's8', name: 'Custom Graphic Design', desc: 'Any custom design need — illustrations, infographics, digital art and more.', price: 1000, turnaround: '2–5 days', icon: Palette, color: 'from-cyan-500 to-blue-600' },
  { id: 's9', name: 'Online Form / Application', desc: 'Fill and submit online forms, government applications, admissions and job applications.', price: 150, turnaround: 'Same day', icon: Package, color: 'from-indigo-500 to-violet-600' },
]

export default function ServicesPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [activeService, setActiveService] = useState<typeof services[0] | null>(null)
  const [desc, setDesc] = useState('')
  const [budget, setBudget] = useState('')
  const [loading, setLoading] = useState(false)

  const handleRequest = (service: typeof services[0]) => {
    if (!user) { router.push('/auth/signin'); return }
    setActiveService(service)
    setDesc('')
    setBudget('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !activeService) return
    setLoading(true)
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
      toast.success('Service request submitted! A designer will be assigned shortly.')
      setActiveService(null)
    } catch {
      toast.error('Failed to submit. Please try again.')
    } finally {
      setLoading(false)
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
            Professional design and printing services at your fingertips. Submit a request and our expert designers will get to work.
          </p>
        </div>
      </section>

      <section className="py-8 bg-orange-50 border-b border-orange-100">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-8">
            {[
              { icon: CheckCircle, text: 'Expert Designers' },
              { icon: Clock, text: 'Fast Turnaround' },
              { icon: Package, text: 'Unlimited Revisions' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-2 text-orange-700 font-medium">
                <Icon className="w-5 h-5 text-orange-500" />
                {text}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map(service => (
              <div key={service.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col">
                <div className={`bg-gradient-to-br ${service.color} p-6 flex items-center gap-4`}>
                  <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                    <service.icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold">{service.name}</h3>
                    <div className="text-white/70 text-xs flex items-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3" /> {service.turnaround}
                    </div>
                  </div>
                </div>
                <div className="p-5 flex flex-col flex-1">
                  <p className="text-gray-500 text-sm leading-relaxed mb-4 flex-1">{service.desc}</p>
                  <div className="mb-4 pt-3 border-t border-gray-100">
                    <div className="text-xs text-gray-400">Starting from</div>
                    <div className="text-violet-700 font-bold text-xl">PKR {service.price.toLocaleString()}</div>
                  </div>
                  <Button onClick={() => handleRequest(service)} className="w-full bg-violet-600 hover:bg-violet-700 text-white">
                    Request Service
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Dialog open={!!activeService} onOpenChange={o => !o && setActiveService(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Request: {activeService?.name}</DialogTitle>
          </DialogHeader>
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
              <Input type="number" placeholder="Optional budget" value={budget} onChange={e => setBudget(e.target.value)} />
            </div>
            <Button type="submit" disabled={loading} className="w-full bg-violet-600 hover:bg-violet-700 text-white">
              {loading ? 'Submitting...' : 'Submit Request'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </MainLayout>
  )
}
