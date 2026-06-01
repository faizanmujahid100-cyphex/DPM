import MainLayout from '@/components/layout/MainLayout'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Award, Target, Heart, Users, ArrowRight } from 'lucide-react'

const team = [
  { name: 'Muhammad Ali', role: 'Founder & CEO', initials: 'MA', color: 'from-violet-500 to-purple-600' },
  { name: 'Hassan Raza', role: 'Lead Designer', initials: 'HR', color: 'from-orange-500 to-pink-500' },
  { name: 'Ayesha Khan', role: 'Production Manager', initials: 'AK', color: 'from-green-500 to-teal-600' },
  { name: 'Zain Ahmed', role: 'Customer Relations', initials: 'ZA', color: 'from-blue-500 to-indigo-600' },
]

const values = [
  { icon: Award, title: 'Quality First', desc: 'We never compromise on quality. Every print is inspected before delivery.' },
  { icon: Heart, title: 'Customer Love', desc: 'Our customers are our family. We go above and beyond to satisfy every order.' },
  { icon: Target, title: 'Precision', desc: 'Attention to detail is our superpower. Every pixel, every color, every cut.' },
  { icon: Users, title: 'Community', desc: 'Supporting local businesses and individuals with affordable printing.' },
]

export default function AboutPage() {
  return (
    <MainLayout>
      <section className="relative py-24 bg-gradient-to-br from-violet-950 via-purple-900 to-slate-900 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '50px 50px' }} />
        <div className="container mx-auto px-4 text-center relative z-10">
          <Badge className="mb-4 bg-white/10 text-white border-white/20">About DPM</Badge>
          <h1 className="text-5xl md:text-6xl font-extrabold mb-6">
            About <span className="bg-gradient-to-r from-orange-400 to-pink-400 bg-clip-text text-transparent">DPM Printing</span>
          </h1>
          <p className="text-xl text-violet-200 max-w-2xl mx-auto leading-relaxed">
            We are a passionate team of designers and printing professionals dedicated to turning your ideas into stunning print realities.
          </p>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <Badge className="mb-4 bg-violet-100 text-violet-700 border-violet-200">Our Story</Badge>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">From a Small Shop to a Trusted Brand</h2>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>DPM Printing Center started as a small printing shop with a big dream — to provide high-quality, affordable printing and design services to businesses and individuals alike.</p>
                <p>Over the years, we have grown into a full-service print and design studio, serving thousands of customers across the region. Our team of experienced designers and printing specialists work together to ensure every project exceeds expectations.</p>
                <p>Today, DPM Printing Center is more than just a printing shop. We are a creative partner for businesses, organizations, and individuals who want to make a lasting impression.</p>
              </div>
              <div className="flex flex-wrap gap-3 mt-6">
                {['Est. 2015', 'Family Owned', '10+ Years Experience', 'Local Business'].map(tag => (
                  <span key={tag} className="px-3 py-1.5 bg-violet-50 text-violet-700 rounded-full text-sm font-medium border border-violet-200">{tag}</span>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { value: '10+', label: 'Years Experience', color: 'from-violet-500 to-purple-600' },
                { value: '5K+', label: 'Happy Customers', color: 'from-orange-500 to-pink-500' },
                { value: '50K+', label: 'Orders Delivered', color: 'from-green-500 to-teal-600' },
                { value: '15+', label: 'Design Experts', color: 'from-blue-500 to-indigo-600' },
              ].map(({ value, label, color }) => (
                <div key={label} className={`rounded-2xl bg-gradient-to-br ${color} p-8 text-white text-center shadow-lg`}>
                  <div className="text-4xl font-extrabold mb-1">{value}</div>
                  <div className="text-white/80 text-sm font-medium">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Badge className="mb-3 bg-orange-100 text-orange-700 border-orange-200">Our Values</Badge>
            <h2 className="text-4xl font-bold text-gray-900">What Drives Us</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-white rounded-2xl p-6 text-center shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-1 transition-all">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Badge className="mb-3 bg-violet-100 text-violet-700 border-violet-200">Meet the Team</Badge>
            <h2 className="text-4xl font-bold text-gray-900">The People Behind DPM</h2>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {team.map(({ name, role, initials, color }) => (
              <div key={name} className="text-center group">
                <div className={`w-24 h-24 rounded-full bg-gradient-to-br ${color} flex items-center justify-center mx-auto mb-4 shadow-xl text-white text-2xl font-bold group-hover:scale-110 transition-transform`}>
                  {initials}
                </div>
                <div className="font-bold text-gray-900">{name}</div>
                <div className="text-gray-500 text-sm">{role}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-gradient-to-r from-violet-600 to-purple-700 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Work With Us?</h2>
          <p className="text-violet-200 mb-8 text-lg">Let's create something amazing together.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact">
              <Button size="lg" className="bg-white text-violet-700 hover:bg-violet-50 px-8 font-semibold">Get in Touch</Button>
            </Link>
            <Link href="/products">
              <Button size="lg" variant="outline" className="border-white/50 text-white hover:bg-white/10 px-8 bg-transparent">
                Browse Products <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </MainLayout>
  )
}
