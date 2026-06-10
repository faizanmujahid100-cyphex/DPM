'use client'

import MainLayout from '@/components/layout/MainLayout'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Phone, Mail, MapPin, Clock, Send, MessageCircle, Globe, AtSign } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { getContactInfo, DEFAULT_CONTACT } from '@/lib/firestore'
import { ContactInfo } from '@/types'

export default function ContactPage() {
  const [sending, setSending] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' })
  const [contact, setContact] = useState<ContactInfo>(DEFAULT_CONTACT)

  useEffect(() => {
    getContactInfo().then(setContact).catch(() => {})
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSending(true)
    await new Promise(r => setTimeout(r, 1200))
    setSending(false)
    toast.success("Message sent! We'll reply within 24 hours.")
    setForm({ name: '', email: '', phone: '', subject: '', message: '' })
  }

  const phoneHref = contact.phoneLink || `tel:${contact.phone.replace(/\s+/g, '')}`

  const infoItems = [
    { icon: Phone, label: 'Phone', value: contact.phone, href: phoneHref, color: 'bg-violet-100 text-violet-600' },
    { icon: MessageCircle, label: 'WhatsApp', value: contact.whatsapp, href: contact.whatsappLink || undefined, color: 'bg-green-100 text-green-600' },
    { icon: Mail, label: 'Email', value: contact.email, href: `mailto:${contact.email}`, color: 'bg-orange-100 text-orange-600' },
    { icon: MapPin, label: 'Address', value: contact.address, href: contact.mapLink || undefined, color: 'bg-green-100 text-green-600' },
    { icon: Clock, label: 'Hours', value: contact.hours, href: undefined, color: 'bg-blue-100 text-blue-600' },
  ]

  const socialLinks = [
    { icon: Globe, href: contact.facebookUrl },
    { icon: MessageCircle, href: contact.whatsappLink },
    { icon: AtSign, href: contact.instagramUrl },
  ].filter((s): s is { icon: typeof Globe; href: string } => !!s.href)

  return (
    <MainLayout>
      <section className="py-20 bg-gradient-to-br from-violet-950 via-purple-900 to-slate-900 text-white">
        <div className="container mx-auto px-4 text-center">
          <Badge className="mb-4 bg-white/10 text-white border-white/20">Get In Touch</Badge>
          <h1 className="text-5xl font-extrabold mb-4">
            Contact <span className="bg-gradient-to-r from-orange-400 to-pink-400 bg-clip-text text-transparent">Us</span>
          </h1>
          <p className="text-violet-200 text-lg max-w-xl mx-auto">
            Have a project in mind? We&apos;d love to hear from you. Send us a message and we&apos;ll respond as soon as possible.
          </p>
        </div>
      </section>

      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-5 gap-10">
            <div className="lg:col-span-2 space-y-5">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Let&apos;s Talk</h2>
                <p className="text-gray-500 leading-relaxed">We&apos;re here to help with any printing or design project, big or small.</p>
              </div>

              {infoItems.filter(item => item.value).map(({ icon: Icon, label, value, href, color }) => {
                const content = (
                  <>
                    <div className={`w-11 h-11 rounded-xl ${color} flex items-center justify-center shrink-0`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{label}</div>
                      <div className="text-gray-800 font-medium whitespace-pre-line">{value}</div>
                    </div>
                  </>
                )
                return href ? (
                  <a key={label} href={href} target={href.startsWith('http') ? '_blank' : undefined} rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
                    className="flex items-start gap-4 p-4 bg-white rounded-2xl border border-gray-100 hover:shadow-md hover:border-violet-200 transition-all">
                    {content}
                  </a>
                ) : (
                  <div key={label} className="flex items-start gap-4 p-4 bg-white rounded-2xl border border-gray-100 hover:shadow-md transition-shadow">
                    {content}
                  </div>
                )
              })}

              {socialLinks.length > 0 && (
                <div className="p-4 bg-white rounded-2xl border border-gray-100">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Follow Us</p>
                  <div className="flex gap-3">
                    {socialLinks.map(({ icon: Icon, href }, i) => (
                      <a key={i} href={href} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-violet-100 hover:bg-violet-600 hover:text-white text-violet-600 flex items-center justify-center transition-colors">
                        <Icon className="w-5 h-5" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="lg:col-span-3 bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Send a Message</h2>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input id="name" placeholder="Your name" required value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="email">Email *</Label>
                    <Input id="email" type="email" placeholder="your@email.com" required value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="phone">Phone</Label>
                    <Input id="phone" placeholder="+92 300 0000000" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Subject *</Label>
                    <Select onValueChange={(v) => { if (typeof v === 'string') setForm(p => ({ ...p, subject: v })) }}>
                      <SelectTrigger><SelectValue placeholder="Select subject" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="product">Product Inquiry</SelectItem>
                        <SelectItem value="service">Service Request</SelectItem>
                        <SelectItem value="quote">Get a Quote</SelectItem>
                        <SelectItem value="complaint">Complaint</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="message">Message *</Label>
                  <Textarea id="message" placeholder="Tell us about your project..." rows={5} required value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))} />
                </div>
                <Button type="submit" disabled={sending} className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white py-5 text-base font-semibold shadow-lg">
                  {sending ? 'Sending...' : <><Send className="mr-2 w-4 h-4" />Send Message</>}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  )
}
