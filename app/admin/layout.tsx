'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Printer, LayoutDashboard, Package, ShoppingBag, Users, Layers, LogOut, Menu, X, Home, Settings, Tag, ClipboardList } from 'lucide-react'
import { Button } from '@/components/ui/button'
import UserAvatar from '@/components/ui/UserAvatar'

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingBag },
  { href: '/admin/order-form', label: 'Order Form', icon: ClipboardList },
  { href: '/admin/products', label: 'Products', icon: Package },
  { href: '/admin/categories', label: 'Categories', icon: Tag },
  { href: '/admin/services', label: 'Services', icon: Layers },
  { href: '/admin/designers', label: 'Designers', icon: Users },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) {
      router.replace('/auth/signin')
    }
  }, [user, loading, router])

  if (loading || !user || user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-violet-950">
        <div className="text-white text-center">
          <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-3" />
          <p className="text-violet-300">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-violet-950 to-slate-900 transform transition-transform duration-200 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center gap-3 p-6 border-b border-white/10">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center">
            <Printer className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="text-white font-bold text-sm">DPM Printing</div>
            <div className="text-orange-300 text-xs">Admin Panel</div>
          </div>
        </div>
        <nav className="p-4 space-y-1">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setSidebarOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 text-violet-200 hover:text-white hover:bg-white/10 rounded-xl transition-all text-sm font-medium"
            >
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          ))}
        </nav>
        <div className="absolute bottom-6 left-4 right-4 space-y-1">
          <Link href="/" className="flex items-center gap-3 w-full px-3 py-2.5 text-violet-300 hover:text-white hover:bg-white/10 rounded-xl transition-all text-sm font-medium">
            <Home className="w-4 h-4" />
            Back to Site
          </Link>
          <Link href="/profile" className="flex items-center gap-3 w-full px-3 py-2.5 text-violet-300 hover:text-white hover:bg-white/10 rounded-xl transition-all text-sm font-medium">
            <Settings className="w-4 h-4" />
            Profile & Settings
          </Link>
          <button
            onClick={logout}
            className="flex items-center gap-3 w-full px-3 py-2.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-all text-sm font-medium"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main */}
      <div className="flex-1 lg:ml-64">
        <header className="sticky top-0 z-30 bg-white border-b border-gray-200 px-6 h-16 flex items-center justify-between shadow-sm">
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
          <div className="flex items-center gap-2">
            <UserAvatar name={user.name} photoURL={user.photoURL} className="w-8 h-8 bg-gradient-to-br from-orange-400 to-pink-500" />
            <div className="hidden sm:block">
              <div className="text-sm font-semibold text-gray-900">{user.name}</div>
              <div className="text-xs text-gray-500">Administrator</div>
            </div>
          </div>
        </header>
        <main className="p-6">{children}</main>
      </div>
    </div>
  )
}
