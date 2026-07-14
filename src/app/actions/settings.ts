'use server'

import { getCurrentUser } from '@/lib/auth'
import { adminDb } from '@/lib/firebase-admin'
import { SettingsUpdateSchema, FormState } from '@/lib/validations'
import { revalidatePath } from 'next/cache'

export async function updateSettings(state: FormState, formData: FormData): Promise<FormState> {
  const user = await getCurrentUser()
  if (!user) {
    return { message: 'Unauthorized' }
  }

  const preferredRiskPct = formData.get('preferredRiskPct') 
    ? parseFloat(formData.get('preferredRiskPct') as string)
    : undefined;

  const validatedFields = SettingsUpdateSchema.safeParse({
    theme: formData.get('theme') || undefined,
    timezone: formData.get('timezone') || undefined,
    currency: formData.get('currency') || undefined,
    broker: formData.get('broker') || undefined,
    preferredRiskPct: isNaN(preferredRiskPct as number) ? undefined : preferredRiskPct,
    language: formData.get('language') || undefined,
  })

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }

  try {
    const data = Object.fromEntries(
      Object.entries(validatedFields.data).filter(([_, v]) => v !== undefined)
    )

    const userRef = adminDb.collection('users').doc(user.id)
    
    // We update the settings field in the user document
    // We get the existing settings first to merge them
    const userDoc = await userRef.get()
    const existingSettings = userDoc.data()?.settings || {}
    
    await userRef.update({
      settings: {
        ...existingSettings,
        ...data
      }
    })

    revalidatePath('/settings')
    return { success: true, message: 'Settings updated successfully.' }
  } catch (error) {
    console.error('Update settings error:', error)
    return { message: 'An error occurred while updating your settings.' }
  }
}
