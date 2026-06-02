'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { updateUser } from '@/lib/firestore'
import {
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { User, Mail, Phone, Save, Lock, LogOut, Eye, EyeOff, ShieldCheck, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'

export default function CustomerProfilePage() {
  const { user, firebaseUser, logout } = useAuth()
  const router = useRouter()

  // Profile form
  const [name, setName] = useState(user?.name || '')
  const [phone, setPhone] = useState(user?.phone || '')
  const [saving, setSaving] = useState(false)

  // Password form
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [changingPass, setChangingPass] = useState(false)

  // Detect if user signed in via Google (no password)
  const isGoogleUser = firebaseUser?.providerData?.some(p => p.providerId === 'google.com') ?? false

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    setSaving(true)
    try {
      await updateUser(user.uid, { name, phone })
      toast.success('Profile updated successfully!')
    } catch {
      toast.error('Failed to update profile.')
    } finally {
      setSaving(false)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!firebaseUser || !firebaseUser.email) return
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match.')
      return
    }
    if (newPassword.length < 6) {
      toast.error('New password must be at least 6 characters.')
      return
    }
    setChangingPass(true)
    try {
      // Re-authenticate first
      const credential = EmailAuthProvider.credential(firebaseUser.email, currentPassword)
      await reauthenticateWithCredential(firebaseUser, credential)
      // Then update
      await updatePassword(firebaseUser, newPassword)
      toast.success('Password changed successfully!')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err: any) {
      const code = err?.code ?? ''
      if (code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
        toast.error('Current password is incorrect.')
      } else if (code === 'auth/weak-password') {
        toast.error('New password is too weak. Use at least 6 characters.')
      } else if (code === 'auth/too-many-requests') {
        toast.error('Too many attempts. Please try again later.')
      } else {
        toast.error(err.message || 'Failed to change password.')
      }
    } finally {
      setChangingPass(false)
    }
  }

  const handleSignOut = async () => {
    await logout()
    router.push('/')
    toast.success('Signed out successfully.')
  }

  return (
    <div className="max-w-lg space-y-5">
      <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>

      {/* Profile Card */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold shrink-0">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="font-bold text-gray-900 text-lg">{user?.name}</div>
            <div className="text-gray-500 text-sm">{user?.email}</div>
            <span className="inline-block mt-1 text-xs px-2 py-0.5 rounded-full bg-violet-100 text-violet-700 font-medium capitalize">
              {user?.role}
            </span>
          </div>
        </div>

        <Separator className="mb-5" />

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name" className="flex items-center gap-1.5 text-sm font-medium">
              <User className="w-3.5 h-3.5 text-violet-500" /> Full Name
            </Label>
            <Input id="name" value={name} onChange={e => setName(e.target.value)} placeholder="Your full name" required />
          </div>
          <div className="space-y-1.5">
            <Label className="flex items-center gap-1.5 text-sm font-medium">
              <Mail className="w-3.5 h-3.5 text-violet-500" /> Email Address
            </Label>
            <Input value={user?.email || ''} disabled className="bg-gray-50 text-gray-400" />
            <p className="text-xs text-gray-400">Email cannot be changed.</p>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="phone" className="flex items-center gap-1.5 text-sm font-medium">
              <Phone className="w-3.5 h-3.5 text-violet-500" /> Phone Number
            </Label>
            <Input id="phone" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+92 300 0000000" />
          </div>
          <Button type="submit" disabled={saving} className="w-full bg-violet-600 hover:bg-violet-700 text-white gap-2">
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </form>
      </div>

      {/* Change Password Card */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center gap-2 mb-1">
          <ShieldCheck className="w-5 h-5 text-violet-600" />
          <h2 className="font-bold text-gray-900">Change Password</h2>
        </div>
        <p className="text-gray-400 text-xs mb-5">Update your account password regularly to stay secure.</p>

        {isGoogleUser ? (
          <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-xl border border-blue-100">
            <AlertCircle className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
            <div>
              <div className="text-sm font-medium text-blue-800">Google Account</div>
              <div className="text-xs text-blue-600 mt-0.5">
                You signed in with Google. Password changes are managed through your Google account settings.
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="currentPass" className="flex items-center gap-1.5 text-sm font-medium">
                <Lock className="w-3.5 h-3.5 text-violet-500" /> Current Password
              </Label>
              <div className="relative">
                <Input
                  id="currentPass"
                  type={showCurrent ? 'text' : 'password'}
                  placeholder="Enter current password"
                  required
                  value={currentPassword}
                  onChange={e => setCurrentPassword(e.target.value)}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="newPass" className="flex items-center gap-1.5 text-sm font-medium">
                <Lock className="w-3.5 h-3.5 text-green-500" /> New Password
              </Label>
              <div className="relative">
                <Input
                  id="newPass"
                  type={showNew ? 'text' : 'password'}
                  placeholder="Min 6 characters"
                  required
                  minLength={6}
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="confirmPass" className="text-sm font-medium">Confirm New Password</Label>
              <Input
                id="confirmPass"
                type="password"
                placeholder="Repeat new password"
                required
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                className={confirmPassword && confirmPassword !== newPassword ? 'border-red-400' : ''}
              />
              {confirmPassword && confirmPassword !== newPassword && (
                <p className="text-red-500 text-xs">Passwords do not match.</p>
              )}
            </div>

            <Button
              type="submit"
              disabled={changingPass || !currentPassword || !newPassword || !confirmPassword}
              className="w-full bg-green-600 hover:bg-green-700 text-white gap-2"
            >
              <ShieldCheck className="w-4 h-4" />
              {changingPass ? 'Updating...' : 'Update Password'}
            </Button>
          </form>
        )}
      </div>

      {/* Sign Out Card */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <div className="font-semibold text-gray-900 text-sm">Sign Out</div>
            <div className="text-gray-400 text-xs mt-0.5">Sign out of your DPM Printing account</div>
          </div>
          <Button
            onClick={handleSignOut}
            variant="outline"
            className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 gap-2"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  )
}
