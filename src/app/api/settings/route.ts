import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { adminDb } from '@/lib/firebase-admin'
import { SettingsUpdateSchema } from '@/lib/validations'

export async function GET(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const userDoc = await adminDb.collection('users').doc(user.id).get()
    const settings = userDoc.data()?.settings || {}
    
    return NextResponse.json({ settings })
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const json = await req.json()
    const validatedData = SettingsUpdateSchema.parse(json)

    const userRef = adminDb.collection('users').doc(user.id)
    
    // We update the settings field in the user document
    // We get the existing settings first to merge them
    const userDoc = await userRef.get()
    const existingSettings = userDoc.data()?.settings || {}
    
    const newSettings = {
      ...existingSettings,
      ...validatedData
    }
    
    await userRef.update({
      settings: newSettings
    })
    
    return NextResponse.json({ settings: newSettings })
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
