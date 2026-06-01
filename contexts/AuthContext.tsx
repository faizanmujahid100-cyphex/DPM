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
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, name: string, role?: UserRole) => Promise<void>
  signInWithGoogle: (role?: UserRole) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

// Ensure/create Firestore user doc after Google auth
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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Handle redirect result when user comes back from Google redirect flow
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
      // Try popup first
      const cred = await signInWithPopup(auth, provider)
      const userData = await syncGoogleUser(cred.user, role)
      setUser(userData)
    } catch (error: any) {
      const code = error?.code ?? ''

      // Popup was blocked — fall back to redirect
      if (code === 'auth/popup-blocked' || code === 'auth/popup-closed-by-user') {
        await signInWithRedirect(auth, provider)
        return // page will reload; redirect result handled in useEffect
      }

      // Surface friendly messages
      if (code === 'auth/unauthorized-domain') {
        throw new Error('This domain is not authorized. Add it in Firebase Console → Authentication → Settings → Authorized domains.')
      }
      if (code === 'auth/cancelled-popup-request') {
        throw new Error('Sign-in cancelled. Please try again.')
      }
      if (code === 'auth/network-request-failed') {
        throw new Error('Network error. Check your internet connection.')
      }

      throw error
    }
  }

  const logout = async () => {
    await signOut(auth)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ firebaseUser, user, loading, signIn, signUp, signInWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
