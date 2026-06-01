import { Badge } from '@/components/ui/badge'
import { CheckCircle2, Shield, Zap, Headphones, Award, RefreshCw } from 'lucide-react'

const reasons = [
  { icon: Award, title: 'Premium Quality', desc: 'State-of-the-art printing equipment for crisp, vibrant results every time.' },
  { icon: Zap, title: 'Fast Turnaround', desc: 'Most orders ready within 24-48 hours. Rush delivery available.' },
  { icon: Shield, title: 'Satisfaction Guaranteed', desc: "Not happy? We'll reprint or refund. Your satisfaction is our priority." },
  { icon: Headphones, title: '24/7 Support', desc: 'Our team is always ready to assist you with any questions or concerns.' },
  { icon: CheckCircle2, title: 'Expert Designers', desc: 'Experienced designers who understand your vision and bring it to life.' },
  { icon: RefreshCw, title: 'Easy Reorders', desc: 'Reorder past designs in seconds through your account dashboard.' },
]

export default function WhyChooseUs() {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <Badge className="mb-4 bg-green-100 text-green-700 border-green-200">Why DPM?</Badge>
            <h2 className="text-4xl font-bold text-gray-900 mb-5 leading-tight">
              Quality You Can{' '}
              <span className="bg-gradient-to-r from-violet-600 to-orange-500 bg-clip-text text-transparent">Trust</span>
            </h2>
            <p className="text-gray-500 text-lg mb-8 leading-relaxed">
              With years of experience in printing and design, DPM Printing Center has built a reputation
              for excellence, reliability, and customer satisfaction.
            </p>
            <div className="flex flex-wrap gap-3">
              {['ISO Certified', 'Eco-Friendly Inks', 'Local & Export'].map(tag => (
                <span key={tag} className="px-3 py-1.5 bg-violet-50 text-violet-700 rounded-full text-sm font-medium border border-violet-200">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {reasons.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="p-5 rounded-2xl bg-gray-50 border border-gray-100 hover:border-violet-200 hover:bg-violet-50/50 transition-all group">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-md">
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-1.5 text-sm">{title}</h4>
                <p className="text-gray-500 text-xs leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
