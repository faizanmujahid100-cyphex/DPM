'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useCart } from '@/contexts/CartContext'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import {
  ShoppingCart, Menu, LogOut,
  Package, Home, Info, Phone, Layers,
  LayoutDashboard, Settings, UserCircle, ChevronDown,
} from 'lucide-react'
import UserAvatar from '@/components/ui/UserAvatar'

const navLinks = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/products', label: 'Products', icon: Package },
  { href: '/services', label: 'Services', icon: Layers },
  { href: '/about', label: 'About', icon: Info },
  { href: '/contact', label: 'Contact', icon: Phone },
]

export default function Header() {
  const { user, logout } = useAuth()
  const { itemCount } = useCart()
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const getDashboardLink = () => {
    if (!user) return '/'
    if (user.role === 'admin' || user.role === 'superadmin') return '/admin'
    if (user.role === 'designer') return '/designer'
    return '/customer'
  }

  const roleBadgeClass = () => {
    if (user?.role === 'admin' || user?.role === 'superadmin') return 'bg-red-100 text-red-700'
    if (user?.role === 'designer') return 'bg-orange-100 text-orange-700'
    return 'bg-green-100 text-green-700'
  }

  const handleLogout = async () => {
    setDropdownOpen(false)
    await logout()
    router.push('/')
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-gradient-to-r from-violet-950/95 via-purple-900/95 to-violet-950/95 backdrop-blur-md shadow-lg">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group shrink-0">
          <Image
            src="/logo.png"
            alt="DPM Printing Center logo"
            width={36}
            height={36}
            className="w-9 h-9 rounded-full shadow-lg group-hover:scale-105 transition-transform"
          />
          <div className="hidden sm:block">
            <div className="text-white font-bold text-lg leading-none">DPM Printing</div>
            <div className="text-orange-300 text-xs font-medium">Center</div>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1 flex-1 justify-center">
          {navLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className="px-3 py-2 text-sm text-violet-200 hover:text-white hover:bg-white/10 rounded-lg transition-all font-medium whitespace-nowrap"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-2 shrink-0">

          {/* Cart */}
          <Link href="/cart" className="relative p-2 text-violet-200 hover:text-white hover:bg-white/10 rounded-lg transition-all">
            <ShoppingCart className="w-5 h-5" />
            {itemCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-5 h-5 flex items-center justify-center bg-orange-500 text-white text-xs font-bold rounded-full">
                {itemCount}
              </span>
            )}
          </Link>

          {user ? (
            <>
              {/* Dashboard button */}
              <Link
                href={getDashboardLink()}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-lg transition-colors shadow-md"
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                Dashboard
              </Link>

              {/* Profile dropdown — custom, no base-ui */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(prev => !prev)}
                  className="flex items-center gap-1.5 pl-0.5 pr-2 py-0.5 rounded-full hover:bg-white/10 transition-colors group"
                >
                  <UserAvatar name={user.name} photoURL={user.photoURL} className="w-8 h-8 bg-gradient-to-br from-orange-400 to-pink-500" />
                  <ChevronDown className={`w-3.5 h-3.5 text-violet-300 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50">
                    {/* User info */}
                    <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                      <div className="flex items-center gap-2.5">
                        <UserAvatar name={user.name} photoURL={user.photoURL} className="w-9 h-9 bg-gradient-to-br from-orange-400 to-pink-500" />
                        <div className="min-w-0">
                          <div className="font-semibold text-gray-900 text-sm truncate">{user.name}</div>
                          <div className="text-xs text-gray-400 truncate">{user.email}</div>
                          <span className={`inline-block text-xs px-1.5 py-0.5 rounded-full font-medium capitalize mt-0.5 ${roleBadgeClass()}`}>
                            {user.role}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Menu items */}
                    <div className="py-1">
                      <Link
                        href={getDashboardLink()}
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-violet-50 hover:text-violet-700 transition-colors"
                      >
                        <LayoutDashboard className="w-4 h-4 text-violet-500" />
                        Dashboard
                      </Link>

                      <Link
                        href="/profile"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-violet-50 hover:text-violet-700 transition-colors"
                      >
                        <Settings className="w-4 h-4 text-gray-400" />
                        Profile & Settings
                      </Link>
                    </div>

                    <div className="border-t border-gray-100 py-1">
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors w-full text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              <Link href="/auth/signin" className="px-3 py-1.5 text-sm text-violet-200 hover:text-white hover:bg-white/10 rounded-lg transition-all font-medium">
                Sign In
              </Link>
              <Link href="/auth/signup" className="px-3 py-1.5 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white text-sm font-semibold rounded-lg transition-all shadow-md">
                Sign Up
              </Link>
            </div>
          )}

          {/* Mobile menu */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger className="md:hidden p-2 text-violet-200 hover:text-white hover:bg-white/10 rounded-lg transition-all">
              <Menu className="w-5 h-5" />
            </SheetTrigger>

            <SheetContent side="right" className="bg-violet-950 border-white/10 text-white w-72">
              <div className="flex items-center gap-2 mb-6">
                <Image
                  src="/logo.png"
                  alt="DPM Printing Center logo"
                  width={32}
                  height={32}
                  className="w-8 h-8 rounded-full"
                />
                <span className="font-bold text-lg">DPM Printing</span>
              </div>

              {user && (
                <div className="mb-4 p-3 bg-white/10 rounded-xl space-y-2">
                  <div className="flex items-center gap-3">
                    <UserAvatar name={user.name} photoURL={user.photoURL} className="w-9 h-9 bg-gradient-to-br from-orange-400 to-pink-500" />
                    <div className="min-w-0">
                      <div className="text-white font-semibold text-sm truncate">{user.name}</div>
                      <div className="text-violet-300 text-xs capitalize">{user.role}</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Link href={getDashboardLink()} onClick={() => setMobileOpen(false)} className="flex items-center justify-center gap-1.5 px-2 py-1.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold rounded-lg transition-colors">
                      <LayoutDashboard className="w-3.5 h-3.5" />
                      Dashboard
                    </Link>
                    <Link href="/profile" onClick={() => setMobileOpen(false)} className="flex items-center justify-center gap-1.5 px-2 py-1.5 border border-white/30 text-white hover:bg-white/10 text-xs font-semibold rounded-lg transition-colors">
                      <UserCircle className="w-3.5 h-3.5" />
                      Profile
                    </Link>
                  </div>
                </div>
              )}

              <nav className="flex flex-col gap-1">
                {navLinks.map(link => (
                  <Link key={link.href} href={link.href} onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-3 py-2.5 text-violet-200 hover:text-white hover:bg-white/10 rounded-lg transition-all text-sm">
                    <link.icon className="w-4 h-4" />
                    {link.label}
                  </Link>
                ))}
              </nav>

              {!user ? (
                <div className="mt-6 flex flex-col gap-2">
                  <Link href="/auth/signin" onClick={() => setMobileOpen(false)} className="block text-center px-4 py-2.5 border border-white/30 text-white hover:bg-white/10 rounded-xl text-sm font-medium transition-all">Sign In</Link>
                  <Link href="/auth/signup" onClick={() => setMobileOpen(false)} className="block text-center px-4 py-2.5 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-xl text-sm font-semibold">Sign Up</Link>
                </div>
              ) : (
                <button onClick={() => { handleLogout(); setMobileOpen(false) }} className="mt-6 flex items-center gap-3 w-full px-3 py-2.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all text-sm font-medium">
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              )}
            </SheetContent>
          </Sheet>

        </div>
      </div>
    </header>
  )
}
