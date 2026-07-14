import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { adminDb } from '@/lib/firebase-admin'
import { z } from 'zod'

const TradeUpdateSchema = z.object({
  symbol: z.string().min(1).optional(),
  entryPrice: z.number().positive().optional(),
  exitPrice: z.number().positive().nullable().optional(),
  quantity: z.number().positive().optional(),
  side: z.enum(['LONG', 'SHORT']).optional(),
  status: z.enum(['OPEN', 'CLOSED']).optional(),
  pnl: z.number().nullable().optional(),
  date: z.string().optional(),
  strategy: z.string().nullable().optional(),
  tags: z.array(z.string()).optional(),
  notes: z.string().nullable().optional(),
})

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { id } = await params
    const tradeRef = adminDb.collection('trades').doc(id)
    const snapshot = await tradeRef.get()

    if (!snapshot.exists || snapshot.data()?.userId !== user.id) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    return NextResponse.json({ trade: { id: snapshot.id, ...snapshot.data() } })
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { id } = await params
    
    const tradeRef = adminDb.collection('trades').doc(id)
    const snapshot = await tradeRef.get()
    
    if (!snapshot.exists || snapshot.data()?.userId !== user.id) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    const json = await req.json()
    const validatedData = TradeUpdateSchema.parse(json)

    const updateData = {
      ...validatedData,
      updatedAt: new Date().toISOString(),
    }
    
    // Convert undefined to null for Firestore or omit it entirely. Let's omit undefined
    Object.keys(updateData).forEach(key => {
      if ((updateData as any)[key] === undefined) {
        delete (updateData as any)[key]
      }
    })

    await tradeRef.update(updateData)

    const updatedSnapshot = await tradeRef.get()
    return NextResponse.json({ trade: { id: updatedSnapshot.id, ...updatedSnapshot.data() } })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: (error as any).errors }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { id } = await params
    
    const tradeRef = adminDb.collection('trades').doc(id)
    const snapshot = await tradeRef.get()
    
    if (!snapshot.exists || snapshot.data()?.userId !== user.id) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    await tradeRef.delete()

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
