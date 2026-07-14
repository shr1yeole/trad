import { useAuth } from '@/contexts/AuthContext'
import { signOut } from 'firebase/auth'
import { auth } from '@/lib/firebase'

export function useAuthHook() {
  const { user, loading, refreshUser } = useAuth()

  const handleLogout = async () => {
    try {
      await signOut(auth)
      await fetch('/api/auth/session', { method: 'DELETE' })
      // Next.js App Router requires window.location for hard navigation out of authenticated context
      window.location.href = '/login'
    } catch (error) {
      console.error('Logout failed', error)
    }
  }

  return {
    user,
    loading,
    logout: handleLogout,
    refreshUser,
  }
}
