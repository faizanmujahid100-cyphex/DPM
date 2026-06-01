'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
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
    const cred = await signInWithPopup(auth, provider)
    const existing = await getUser(cred.user.uid)
    if (!existing) {
      await createUser(cred.user.uid, {
        email: cred.user.email!,
        name: cred.user.displayName || 'User',
        role,
      })
    }
    const userData = await getUser(cred.user.uid)
    setUser(userData)
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
