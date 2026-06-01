'use client'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowRight, Star, Printer, Palette, Zap } from 'lucide-react'

export default function HeroSection() {
  return (
    <section className="relative min-h-[92vh] flex items-center overflow-hidden bg-gradient-to-br from-violet-950 via-purple-900 to-slate-900">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-orange-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-violet-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-3xl" />
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }} />
      </div>

      <div className="container mx-auto px-4 py-20 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <Badge className="mb-6 bg-orange-500/20 text-orange-300 border-orange-500/30 hover:bg-orange-500/30 px-4 py-1.5 text-sm">
            <Star className="w-3 h-3 mr-1.5 fill-orange-300" />
            Premium Printing & Design Services
          </Badge>

          <h1 className="text-5xl md:text-7xl font-extrabold text-white leading-tight mb-6">
            Your Vision,{' '}
            <span className="bg-gradient-to-r from-orange-400 via-pink-400 to-violet-400 bg-clip-text text-transparent">
              Our Craft
            </span>
          </h1>

          <p className="text-xl text-violet-200 max-w-2xl mx-auto mb-10 leading-relaxed">
            DPM Printing Center — where creativity meets precision.
            Custom printing, professional design, and unmatched quality for all your branding needs.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link href="/products">
              <Button size="lg" className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white border-0 shadow-xl shadow-orange-500/30 px-8 py-6 text-base font-semibold group">
                Shop Products
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="/services">
              <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 px-8 py-6 text-base font-semibold backdrop-blur-sm bg-transparent">
                Explore Services
              </Button>
            </Link>
          </div>

          <div className="flex flex-wrap justify-center gap-4">
            {[
              { icon: Printer, label: 'High Quality Print' },
              { icon: Palette, label: 'Custom Design' },
              { icon: Zap, label: 'Fast Delivery' },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-violet-200 text-sm">
                <Icon className="w-4 h-4 text-orange-400" />
                {label}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 60L1440 60L1440 30C1200 55 900 5 720 25C540 45 240 5 0 35L0 60Z" fill="rgb(249 250 251)" />
        </svg>
      </div>
    </section>
  )
}
