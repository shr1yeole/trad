import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { adminDb } from '@/lib/firebase-admin'

export async function GET(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const snapshot = await adminDb.collection('notifications')
      .where('userId', '==', user.id)
      .orderBy('createdAt', 'desc')
      .limit(20)
      .get()
      
    const notifications = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    
    return NextResponse.json({ notifications })
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
