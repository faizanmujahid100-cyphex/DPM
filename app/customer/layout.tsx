'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Printer, ShoppingBag, User, Layers, Home, LogOut, Menu, X, Settings, Globe } from 'lucide-react'
import { Button } from '@/components/ui/button'
import UserAvatar from '@/components/ui/UserAvatar'

const navItems = [
  { href: '/customer', label: 'Dashboard', icon: Home },
  { href: '/customer/orders', label: 'My Orders', icon: ShoppingBag },
  { href: '/customer/services', label: 'Service Requests', icon: Layers },
  { href: '/customer/profile', label: 'Profile', icon: User },
]

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout, needsProfileComplete } = useAuth()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    if (!loading && !user) router.replace('/auth/signin')
    if (!loading && user && user.role !== 'customer') router.replace(user.role === 'designer' ? '/designer' : '/admin')
    if (!loading && user && needsProfileComplete) router.replace('/auth/complete-profile')
  }, [user, loading, router, needsProfileComplete])

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-2 border-violet-300 border-t-violet-600 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex bg-gray-50">
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center gap-3 p-6 border-b border-gray-100">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center">
            <Printer className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="font-bold text-gray-900 text-sm">DPM Printing</div>
            <div className="text-orange-500 text-xs">My Account</div>
          </div>
        </div>
        <nav className="p-4 space-y-1">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setSidebarOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 text-gray-600 hover:text-violet-700 hover:bg-violet-50 rounded-xl transition-all text-sm font-medium"
            >
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          ))}
        </nav>
        <div className="absolute bottom-6 left-4 right-4 space-y-1">
          <Link href="/" className="flex items-center gap-3 w-full px-3 py-2.5 text-gray-500 hover:text-violet-700 hover:bg-violet-50 rounded-xl transition-all text-sm font-medium">
            <Globe className="w-4 h-4" />
            Back to Site
          </Link>
          <Link href="/profile" className="flex items-center gap-3 w-full px-3 py-2.5 text-gray-500 hover:text-violet-700 hover:bg-violet-50 rounded-xl transition-all text-sm font-medium">
            <Settings className="w-4 h-4" />
            Profile & Settings
          </Link>
          <button
            onClick={logout}
            className="flex items-center gap-3 w-full px-3 py-2.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-xl transition-all text-sm font-medium"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {sidebarOpen && <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      <div className="flex-1 lg:ml-64">
        <header className="sticky top-0 z-30 bg-white border-b border-gray-200 px-6 h-16 flex items-center justify-between shadow-sm">
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
          <div className="flex items-center gap-2">
            <UserAvatar name={user.name} photoURL={user.photoURL} className="w-8 h-8 bg-gradient-to-br from-violet-500 to-purple-600" />
            <div className="hidden sm:block">
              <div className="text-sm font-semibold text-gray-900">{user.name}</div>
              <div className="text-xs text-gray-500">Customer</div>
            </div>
          </div>
        </header>
        <main className="p-6">{children}</main>
      </div>
    </div>
  )
}
