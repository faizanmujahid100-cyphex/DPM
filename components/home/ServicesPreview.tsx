'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import CloudImg from '@/components/ui/CloudImg'
import { getServices } from '@/lib/firestore'
import { Service } from '@/types'
import { ArrowRight, Clock, Layers } from 'lucide-react'

export default function ServicesPreview() {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getServices().then(all => setServices(all.slice(0, 6))).catch(() => {}).finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <section className="py-20 bg-gradient-to-br from-violet-50 via-purple-50 to-white">
      <div className="container mx-auto px-4 flex justify-center">
        <div className="w-8 h-8 border-2 border-violet-300 border-t-violet-600 rounded-full animate-spin" />
      </div>
    </section>
  )

  if (services.length === 0) return null

  return (
    <section className="py-20 bg-gradient-to-br from-violet-50 via-purple-50 to-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <Badge className="mb-3 bg-orange-100 text-orange-700 border-orange-200">Design Services</Badge>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            More Than Just <span className="text-orange-500">Printing</span>
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto">We offer complete design services to make your brand stand out.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
          {services.map(service => (
            <div key={service.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-all group">
              <div className="relative h-36 bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center">
                <CloudImg
                  src={service.imageUrl}
                  alt={service.name}
                  className="w-full h-full object-cover"
                  fallback={<Layers className="w-12 h-12 text-white/50" />}
                />
                <div className="absolute bottom-2 right-2">
                  <span className="flex items-center gap-1 px-2 py-0.5 bg-black/40 backdrop-blur-sm text-white text-xs rounded-full">
                    <Clock className="w-3 h-3" /> {service.turnaround}
                  </span>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-1">{service.name}</h3>
                <p className="text-gray-500 text-sm leading-relaxed mb-3 line-clamp-2">{service.description}</p>
                <div className="text-violet-700 font-bold text-sm">PKR {service.price.toLocaleString()}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center">
          <Link href="/services">
            <Button variant="outline" className="border-violet-300 text-violet-700 hover:bg-violet-50 px-8 group">
              See All Services
              <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
