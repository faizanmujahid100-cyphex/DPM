import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight, MessageCircle } from 'lucide-react'

export default function CTASection() {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-600 via-purple-600 to-orange-500 p-12 text-center shadow-2xl">
          <div className="absolute inset-0 opacity-20" style={{
            backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
            backgroundSize: '30px 30px',
          }} />
          <div className="relative z-10">
            <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-4">
              Ready to Print Something Amazing?
            </h2>
            <p className="text-violet-100 text-lg mb-8 max-w-xl mx-auto">
              Join thousands of happy customers. Start your order today or submit a service request.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/products">
                <Button size="lg" className="bg-white text-violet-700 hover:bg-violet-50 px-8 font-semibold shadow-lg group">
                  Start Shopping
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/contact">
                <Button size="lg" variant="outline" className="border-white/50 text-white hover:bg-white/10 px-8 font-semibold bg-transparent">
                  <MessageCircle className="mr-2 w-4 h-4" />
                  Contact Us
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
