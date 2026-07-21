import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { userService, UserProfile } from '@/services/userService'

export function useUser() {
  const { user, loading: authLoading, refreshUser } = useAuth()
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const updateProfile = async (data: Partial<UserProfile>) => {
    if (!user?.id) return

    setUpdating(true)
    setError(null)
    
    try {
      await userService.updateUserProfile(user.id, data)
      await refreshUser() // Refresh local user state
    } catch (err: any) {
      console.error('Failed to update profile:', err)
      setError(err)
      throw err
    } finally {
      setUpdating(false)
    }
  }

  return {
    user,
    loading: authLoading,
    updateProfile,
    updating,
    error
  }
}
