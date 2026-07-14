'use server'

import { getCurrentUser } from '@/lib/auth'
import { adminDb, adminAuth } from '@/lib/firebase-admin'
import { ProfileUpdateSchema, FormState } from '@/lib/validations'
import { revalidatePath } from 'next/cache'

export async function updateProfile(state: FormState, formData: FormData): Promise<FormState> {
  const user = await getCurrentUser()
  if (!user) {
    return { message: 'Unauthorized' }
  }

  const validatedFields = ProfileUpdateSchema.safeParse({
    name: formData.get('name') || undefined,
    email: formData.get('email') || undefined,
  })

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }

  const { name, email } = validatedFields.data

  try {
    if (email && email !== user.email) {
      try {
        await adminAuth.updateUser(user.id, { email })
      } catch (err: any) {
        if (err.code === 'auth/email-already-exists') {
          return { errors: { email: ['Email already in use.'] } }
        }
        throw err
      }
    }
    
    if (name && name !== user.name) {
      await adminAuth.updateUser(user.id, { displayName: name })
    }

    await adminDb.collection('users').doc(user.id).update({ 
      ...(name && { name }), 
      ...(email && { email }) 
    })

    revalidatePath('/settings')
    return { success: true, message: 'Profile updated successfully.' }
  } catch (error) {
    console.error('Update profile error:', error)
    return { message: 'An error occurred while updating your profile.' }
  }
}
