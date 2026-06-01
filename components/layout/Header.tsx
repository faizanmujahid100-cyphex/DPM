'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useCart } from '@/contexts/CartContext'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import {
  Printer, ShoppingCart, Menu, User, LogOut, Settings,
  Package, Palette, Home, Info, Phone, Layers,
} from 'lucide-react'

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
  const [mobileOpen, setMobileOpen] = useState(false)

  const getDashboardLink = () => {
    if (!user) return null
    if (user.role === 'admin') return '/admin'
    if (user.role === 'designer') return '/designer'
    return '/customer'
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-gradient-to-r from-violet-950/95 via-purple-900/95 to-violet-950/95 backdrop-blur-md shadow-lg">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
            <Printer className="w-5 h-5 text-white" />
          </div>
          <div className="hidden sm:block">
            <div className="text-white font-bold text-lg leading-none">DPM Printing</div>
            <div className="text-orange-300 text-xs font-medium">Center</div>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className="px-3 py-2 text-sm text-violet-200 hover:text-white hover:bg-white/10 rounded-lg transition-all font-medium"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link href="/cart">
            <Button variant="ghost" size="icon" className="relative text-violet-200 hover:text-white hover:bg-white/10">
              <ShoppingCart className="w-5 h-5" />
              {itemCount > 0 && (
                <Badge className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center p-0 bg-orange-500 text-white text-xs border-0">
                  {itemCount}
                </Badge>
              )}
            </Button>
          </Link>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger
                render={<Button variant="ghost" size="icon" className="text-violet-200 hover:text-white hover:bg-white/10" />}
              >
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="bg-gradient-to-br from-orange-400 to-pink-500 text-white text-xs font-bold">
                    {user.name?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>
                  <div className="font-semibold">{user.name}</div>
                  <div className="text-xs text-muted-foreground capitalize">{user.role}</div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {getDashboardLink() && (
                  <DropdownMenuItem
                    render={<Link href={getDashboardLink()!} />}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    {user.role === 'admin' ? <Settings className="w-4 h-4" /> :
                     user.role === 'designer' ? <Palette className="w-4 h-4" /> :
                     <User className="w-4 h-4" />}
                    Dashboard
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={logout}
                  className="text-red-600 flex items-center gap-2 cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              <Link href="/auth/signin">
                <Button variant="ghost" size="sm" className="text-violet-200 hover:text-white hover:bg-white/10">
                  Sign In
                </Button>
              </Link>
              <Link href="/auth/signup">
                <Button size="sm" className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white border-0 shadow-md">
                  Sign Up
                </Button>
              </Link>
            </div>
          )}

          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger
              render={<Button variant="ghost" size="icon" className="md:hidden text-violet-200 hover:text-white hover:bg-white/10" />}
            >
              <Menu className="w-5 h-5" />
            </SheetTrigger>
            <SheetContent side="right" className="bg-violet-950 border-white/10 text-white w-72">
              <div className="flex items-center gap-2 mb-8">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center">
                  <Printer className="w-4 h-4 text-white" />
                </div>
                <span className="font-bold text-lg">DPM Printing</span>
              </div>
              <nav className="flex flex-col gap-1">
                {navLinks.map(link => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 text-violet-200 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                  >
                    <link.icon className="w-4 h-4" />
                    {link.label}
                  </Link>
                ))}
                {!user && (
                  <div className="mt-4 flex flex-col gap-2">
                    <Link href="/auth/signin" onClick={() => setMobileOpen(false)}>
                      <Button variant="outline" className="w-full border-white/30 text-white hover:bg-white/10">Sign In</Button>
                    </Link>
                    <Link href="/auth/signup" onClick={() => setMobileOpen(false)}>
                      <Button className="w-full bg-gradient-to-r from-orange-500 to-pink-500">Sign Up</Button>
                    </Link>
                  </div>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
