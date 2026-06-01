import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowRight, FileText, PenTool, Type, Layers, Camera, Globe } from 'lucide-react'

const services = [
  { name: 'Logo & Brand Design', desc: 'Professional logos and complete brand identity kits', icon: PenTool, color: 'bg-violet-100 text-violet-600' },
  { name: 'Typing & Data Entry', desc: 'Fast and accurate typing for documents and data', icon: Type, color: 'bg-orange-100 text-orange-600' },
  { name: 'Certificate Design', desc: 'Custom certificate and award design services', icon: FileText, color: 'bg-green-100 text-green-600' },
  { name: 'Brochure & Flyer', desc: 'Eye-catching marketing material design', icon: Layers, color: 'bg-blue-100 text-blue-600' },
  { name: 'Photo Editing', desc: 'Professional photo retouching and manipulation', icon: Camera, color: 'bg-pink-100 text-pink-600' },
  { name: 'Social Media Design', desc: 'Engaging posts, stories and banner designs', icon: Globe, color: 'bg-yellow-100 text-yellow-600' },
]

export default function ServicesPreview() {
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
          {services.map(({ name, desc, icon: Icon, color }) => (
            <div key={name} className="flex items-start gap-4 bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-all group">
              <div className={`w-11 h-11 rounded-xl ${color} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">{name}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
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
