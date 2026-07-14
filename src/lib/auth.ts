import 'server-only'
import { cookies } from 'next/headers'
import { adminAuth, adminDb } from './firebase-admin'

export async function getCurrentUser() {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get('session')?.value

  if (!sessionCookie) return null

  try {
    // We are now storing raw ID token instead of Session Cookie
    const decodedClaims = await adminAuth.verifyIdToken(sessionCookie)
    const uid = decodedClaims.uid

    // Attempt to fetch from Firestore. Might fail if no Service Account.
    try {
      const userDoc = await adminDb.collection('users').doc(uid).get()
      
      if (!userDoc.exists) {
        return {
          id: uid,
          email: decodedClaims.email,
          name: decodedClaims.name,
          avatar: decodedClaims.picture,
          role: 'user',
          settings: null
        }
      }

      const userData = userDoc.data()
      return {
        id: uid,
        email: userData?.email || decodedClaims.email,
        name: userData?.name || decodedClaims.name,
        avatar: userData?.avatar || decodedClaims.picture,
        role: userData?.role || 'user',
        settings: userData?.settings || null,
      }
    } catch (dbError) {
      // Fallback if Firestore fails (no admin credentials)
      return {
        id: uid,
        email: decodedClaims.email,
        name: decodedClaims.name,
        avatar: decodedClaims.picture,
        role: 'user',
        settings: null
      }
    }
  } catch (error) {
    console.error('Failed to get current user', error)
    return null
  }
}
