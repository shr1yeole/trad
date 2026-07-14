import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { adminDb } from '@/lib/firebase-admin'
import { z } from 'zod'

const TradeCreateSchema = z.object({
  symbol: z.string().min(1),
  entryPrice: z.number().positive(),
  quantity: z.number().positive(),
  side: z.enum(['LONG', 'SHORT']),
  status: z.enum(['OPEN', 'CLOSED']),
  date: z.string().optional(),
  strategy: z.string().optional(),
  tags: z.array(z.string()).optional(),
  notes: z.string().optional(),
})

export async function GET(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')
  
  try {
    let query: FirebaseFirestore.Query = adminDb.collection('trades').where('userId', '==', user.id)

    if (status) {
      query = query.where('status', '==', status)
    }

    // Note: To order by date after filtering by status, a composite index in Firestore is required.
    query = query.orderBy('date', 'desc')

    const snapshot = await query.get()
    const trades = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))

    return NextResponse.json({ trades })
  } catch (error) {
    console.error('Error fetching trades:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const json = await req.json()
    const validatedData = TradeCreateSchema.parse(json)

    const tradeData = {
      ...validatedData,
      userId: user.id,
      date: validatedData.date || new Date().toISOString(),
      createdAt: new Date().toISOString(),
    }

    const docRef = await adminDb.collection('trades').add(tradeData)

    return NextResponse.json({ trade: { id: docRef.id, ...tradeData } }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: (error as any).errors }, { status: 400 })
    }
    console.error('Error creating trade:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
