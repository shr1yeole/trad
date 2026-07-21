import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'

export interface UserProfile {
  uid: string
  name: string | null
  email: string | null
  photoURL: string | null
  createdAt: any
  updatedAt: any
  plan: string
  role: string
  isEmailVerified: boolean
  preferences: {
    theme: string
    currency: string
    timezone: string
  }
}

export const userService = {
  /**
   * Fetch a user profile by UID
   */
  async getUserProfile(uid: string): Promise<UserProfile | null> {
    try {
      const docRef = doc(db, 'users', uid)
      const docSnap = await getDoc(docRef)
      if (docSnap.exists()) {
        return docSnap.data() as UserProfile
      }
      return null
    } catch (error) {
      console.error('Error fetching user profile:', error)
      return null
    }
  },

  /**
   * Create a new user profile if it doesn't already exist
   */
  async createUserProfile(user: any, additionalData: any = {}): Promise<void> {
    try {
      const docRef = doc(db, 'users', user.uid)
      const docSnap = await getDoc(docRef)
      
      // Only create if it doesn't exist
      if (!docSnap.exists()) {
        const newUserProfile = {
          uid: user.uid,
          name: user.displayName || additionalData.name || '',
          email: user.email || '',
          photoURL: user.photoURL || '',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          plan: 'Free',
          role: 'user',
          isEmailVerified: user.emailVerified || false,
          preferences: {
            theme: 'dark',
            currency: 'USD',
            timezone: 'UTC'
          },
          ...additionalData
        }
        await setDoc(docRef, newUserProfile)
      }
    } catch (error) {
      console.error('Error creating user profile:', error)
    }
  },

  /**
   * Update an existing user profile
   */
  async updateUserProfile(uid: string, data: Partial<UserProfile>): Promise<void> {
    try {
      const docRef = doc(db, 'users', uid)
      await updateDoc(docRef, {
        ...data,
        updatedAt: serverTimestamp()
      })
    } catch (error) {
      console.error('Error updating user profile:', error)
      throw error
    }
  }
}
