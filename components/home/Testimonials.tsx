import { Badge } from '@/components/ui/badge'
import { Star, Quote } from 'lucide-react'

const testimonials = [
  { name: 'Ahmed Khan', role: 'Business Owner', text: "DPM printed our company brochures with stunning quality. The colors were vibrant and the delivery was on time. Highly recommended!", rating: 5 },
  { name: 'Sara Malik', role: 'Event Organizer', text: "Used DPM for our wedding banners and photo frames. The team was professional and the output was absolutely beautiful!", rating: 5 },
  { name: 'Bilal Hassan', role: 'Marketing Manager', text: "Best printing center in the area. Their custom t-shirt printing is top-notch and the prices are very competitive.", rating: 5 },
  { name: 'Fatima Rizvi', role: 'Freelancer', text: "Submitted my card design online and received perfectly printed cards within 24 hours. The process was seamless!", rating: 5 },
]

export default function Testimonials() {
  return (
    <section className="py-20 bg-gradient-to-br from-slate-900 via-violet-950 to-slate-900">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <Badge className="mb-3 bg-white/10 text-white border-white/20">Testimonials</Badge>
          <h2 className="text-4xl font-bold text-white mb-4">
            What Our <span className="text-orange-400">Customers Say</span>
          </h2>
          <p className="text-violet-300 max-w-xl mx-auto">Real stories from real customers who trust DPM Printing Center.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {testimonials.map(({ name, role, text, rating }) => (
            <div key={name} className="bg-white/10 backdrop-blur-sm border border-white/15 rounded-2xl p-6 hover:bg-white/15 transition-colors">
              <Quote className="w-8 h-8 text-orange-400/50 mb-3" />
              <p className="text-violet-100 mb-5 leading-relaxed">{text}</p>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-white font-semibold">{name}</div>
                  <div className="text-violet-400 text-sm">{role}</div>
                </div>
                <div className="flex gap-0.5">
                  {Array.from({ length: rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-orange-400 text-orange-400" />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
