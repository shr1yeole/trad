'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { userService } from '@/services/userService'

type User = {
  id: string
  email: string
  name: string | null
  avatar: string | null
  role: string
  plan?: string
  preferences?: {
    theme: string
    currency: string
    timezone: string
  }
}

type AuthContextType = {
  user: User | null
  loading: boolean
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchUser = async () => {
    try {
      const { auth } = require('@/lib/firebase')
      const currentUser = auth.currentUser
      if (!currentUser) {
        setUser(null)
        return
      }

      const profile = await userService.getUserProfile(currentUser.uid)
      
      if (profile) {
        setUser({
          id: profile.uid,
          email: profile.email || '',
          name: profile.name,
          avatar: profile.photoURL,
          role: profile.role || 'user',
          plan: profile.plan || 'Free',
          preferences: profile.preferences,
        })
      } else {
        // Fallback if profile doesn't exist yet but user is authenticated
        setUser({
          id: currentUser.uid,
          email: currentUser.email || '',
          name: currentUser.displayName,
          avatar: currentUser.photoURL,
          role: 'user',
        })
      }
    } catch (error) {
      console.error('Failed to fetch user', error)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Listen for Firebase token changes (including auto-refreshes)
    const { onIdTokenChanged } = require('firebase/auth')
    const { auth } = require('@/lib/firebase')
    
    const unsubscribe = onIdTokenChanged(auth, async (firebaseUser: any) => {
      if (firebaseUser) {
        // Token might have refreshed, update server session
        const idToken = await firebaseUser.getIdToken()
        await fetch('/api/auth/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ idToken })
        })
        // Refresh local user state
        fetchUser()
      } else {
        // User logged out
        await fetch('/api/auth/session', { method: 'DELETE' })
        setUser(null)
        setLoading(false)
      }
    })

    return () => unsubscribe()
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, refreshUser: fetchUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
