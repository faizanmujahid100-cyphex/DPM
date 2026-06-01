import Link from 'next/link'
import { Printer, Phone, Mail, MapPin, Share2, MessageCircle, AtSign } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-gradient-to-b from-violet-950 to-slate-950 text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center">
                <Printer className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="font-bold text-xl">DPM Printing Center</div>
                <div className="text-orange-300 text-sm">Your Design. Our Craft.</div>
              </div>
            </div>
            <p className="text-violet-300 text-sm leading-relaxed max-w-sm">
              Premier graphic design and printing solutions. From business cards to custom apparel,
              we bring your vision to life with precision and passion.
            </p>
            <div className="flex gap-3 mt-5">
              {[Share2, MessageCircle, AtSign].map((Icon, i) => (
                <a key={i} href="#" className="w-9 h-9 rounded-full bg-white/10 hover:bg-orange-500 flex items-center justify-center transition-colors">
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">Quick Links</h4>
            <ul className="space-y-2">
              {[
                { href: '/products', label: 'Products' },
                { href: '/services', label: 'Services' },
                { href: '/about', label: 'About Us' },
                { href: '/contact', label: 'Contact' },
                { href: '/auth/signin', label: 'Sign In' },
                { href: '/auth/signup', label: 'Create Account' },
              ].map(link => (
                <li key={link.href}>
                  <Link href={link.href} className="text-violet-300 hover:text-orange-300 text-sm transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">Contact Us</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-sm text-violet-300">
                <MapPin className="w-4 h-4 text-orange-400 mt-0.5 shrink-0" />
                <span>DPM Printing Center<br />Main Branch, Pakistan</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-violet-300">
                <Phone className="w-4 h-4 text-orange-400 shrink-0" />
                <span>+92 300 0000000</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-violet-300">
                <Mail className="w-4 h-4 text-orange-400 shrink-0" />
                <span>info@dpmprinting.com</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container mx-auto px-4 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-violet-400 text-xs">&copy; 2024 DPM Printing Center. All rights reserved.</p>
          <p className="text-violet-400 text-xs">Crafted with passion for quality printing.</p>
        </div>
      </div>
    </footer>
  )
}
