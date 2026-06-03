'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  User as FirebaseUser,
} from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { createUser, getUser } from '@/lib/firestore'
import { User, UserRole } from '@/types'

interface AuthContextType {
  firebaseUser: FirebaseUser | null
  user: User | null
  loading: boolean
  needsProfileComplete: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, name: string, role?: UserRole) => Promise<void>
  signInWithGoogle: (role?: UserRole) => Promise<void>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

async function syncGoogleUser(fbUser: FirebaseUser, role: UserRole = 'customer') {
  const existing = await getUser(fbUser.uid)
  if (!existing) {
    await createUser(fbUser.uid, {
      email: fbUser.email!,
      name: fbUser.displayName || 'User',
      role,
    })
  }
  return getUser(fbUser.uid)
}

function isProfileIncomplete(u: User | null): boolean {
  if (!u) return false
  if (u.role === 'admin' || u.role === 'designer') return false
  return !u.profileComplete && (!u.phone || !u.address)
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const refreshUser = async () => {
    if (firebaseUser) {
      const userData = await getUser(firebaseUser.uid)
      setUser(userData)
    }
  }

  useEffect(() => {
    getRedirectResult(auth)
      .then(async (result) => {
        if (result?.user) {
          const userData = await syncGoogleUser(result.user, 'customer')
          setUser(userData)
        }
      })
      .catch(() => {})

    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser)
      if (fbUser) {
        const userData = await getUser(fbUser.uid)
        setUser(userData)
      } else {
        setUser(null)
      }
      setLoading(false)
    })
    return unsub
  }, [])

  const signIn = async (email: string, password: string) => {
    const cred = await signInWithEmailAndPassword(auth, email, password)
    const userData = await getUser(cred.user.uid)
    setUser(userData)
  }

  const signUp = async (email: string, password: string, name: string, role: UserRole = 'customer') => {
    const cred = await createUserWithEmailAndPassword(auth, email, password)
    await createUser(cred.user.uid, { email, name, role })
    const userData = await getUser(cred.user.uid)
    setUser(userData)
  }

  const signInWithGoogle = async (role: UserRole = 'customer') => {
    const provider = new GoogleAuthProvider()
    provider.addScope('email')
    provider.addScope('profile')
    provider.setCustomParameters({ prompt: 'select_account' })

    try {
      const cred = await signInWithPopup(auth, provider)
      const userData = await syncGoogleUser(cred.user, role)
      setUser(userData)
    } catch (error: any) {
      const code = error?.code ?? ''
      if (code === 'auth/popup-blocked' || code === 'auth/popup-closed-by-user') {
        await signInWithRedirect(auth, provider)
        return
      }
      if (code === 'auth/unauthorized-domain') throw new Error('This domain is not authorized in Firebase Console.')
      if (code === 'auth/cancelled-popup-request') throw new Error('Sign-in cancelled. Please try again.')
      if (code === 'auth/network-request-failed') throw new Error('Network error. Check your connection.')
      throw error
    }
  }

  const logout = async () => {
    await signOut(auth)
    setUser(null)
  }

  const needsProfileComplete = isProfileIncomplete(user)

  return (
    <AuthContext.Provider value={{ firebaseUser, user, loading, needsProfileComplete, signIn, signUp, signInWithGoogle, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
