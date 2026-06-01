'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Printer, Eye, EyeOff, Globe } from 'lucide-react'
import { toast } from 'sonner'

const schema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})
type FormData = z.infer<typeof schema>

export default function SignInPage() {
  const { signIn, signInWithGoogle } = useAuth()
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({ resolver: zodResolver(schema) })

  const onSubmit = async (data: FormData) => {
    try {
      await signIn(data.email, data.password)
      toast.success('Welcome back!')
      router.push('/')
    } catch (err: any) {
      toast.error(err.message || 'Sign in failed. Please check your credentials.')
    }
  }

  const handleGoogle = async () => {
    setGoogleLoading(true)
    try {
      await signInWithGoogle()
      toast.success('Welcome back!')
      router.push('/')
    } catch (err: any) {
      toast.error(err.message || 'Google sign in failed.')
    } finally {
      setGoogleLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-violet-950 via-purple-900 to-slate-900 items-center justify-center overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-orange-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-violet-500/20 rounded-full blur-3xl" />
        <div className="relative z-10 text-center px-12">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center mx-auto mb-8 shadow-2xl">
            <Printer className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-4xl font-extrabold text-white mb-4">Welcome Back!</h2>
          <p className="text-violet-300 text-lg leading-relaxed">Sign in to manage your orders, track designs, and access exclusive printing deals.</p>
          <div className="mt-10 grid grid-cols-2 gap-4">
            {[
              { value: '5K+', label: 'Customers' },
              { value: '50K+', label: 'Orders' },
              { value: '4.9★', label: 'Rating' },
              { value: '48hrs', label: 'Delivery' },
            ].map(({ value, label }) => (
              <div key={label} className="bg-white/10 rounded-xl p-4 backdrop-blur-sm border border-white/15">
                <div className="text-2xl font-bold text-white">{value}</div>
                <div className="text-violet-300 text-xs">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <Link href="/" className="flex items-center gap-2 mb-8 lg:hidden">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center">
                <Printer className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-violet-900">DPM Printing Center</span>
            </Link>
            <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Sign In</h1>
            <p className="text-gray-500">Enter your credentials to access your account</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" type="email" placeholder="you@example.com" {...register('email')} className={errors.email ? 'border-red-400' : ''} />
              {errors.email && <p className="text-red-500 text-xs">{errors.email.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input id="password" type={showPassword ? 'text' : 'password'} placeholder="••••••••" {...register('password')} className={`pr-10 ${errors.password ? 'border-red-400' : ''}`} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs">{errors.password.message}</p>}
            </div>

            <Button type="submit" disabled={isSubmitting} className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white py-5 font-semibold text-base shadow-lg">
              {isSubmitting ? 'Signing In...' : 'Sign In'}
            </Button>
          </form>

          <div className="my-6 flex items-center gap-3">
            <Separator className="flex-1" />
            <span className="text-gray-400 text-sm">or</span>
            <Separator className="flex-1" />
          </div>

          <Button variant="outline" onClick={handleGoogle} disabled={googleLoading} className="w-full py-5 font-medium border-gray-200 hover:bg-gray-50 gap-2">
            <Globe className="w-5 h-5 text-blue-500" />
            {googleLoading ? 'Connecting...' : 'Continue with Google'}
          </Button>

          <p className="text-center text-gray-500 text-sm mt-6">
            Don't have an account?{' '}
            <Link href="/auth/signup" className="text-violet-600 font-semibold hover:underline">
              Create Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
