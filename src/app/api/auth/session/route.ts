import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { adminAuth, adminDb } from '@/lib/firebase-admin';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { idToken, name } = body;

    if (!idToken) {
      return NextResponse.json({ error: 'Missing ID token' }, { status: 400 });
    }

    // Verify the ID token (works without Service Account as long as projectId is set)
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    const uid = decodedToken.uid;
    
    // Attempt to create user document if it doesn't exist.
    // If adminDb fails (e.g., missing Service Account), catch and proceed so login works.
    try {
      const userRef = adminDb.collection('users').doc(uid);
      const userSnap = await userRef.get();
      
      if (!userSnap.exists) {
        await userRef.set({
          email: decodedToken.email,
          name: name || decodedToken.name || '',
          avatar: decodedToken.picture || null,
          role: 'user',
          settings: {
            theme: 'system',
            notifications: true,
            currency: 'USD',
          },
          createdAt: new Date().toISOString(),
        });
      }
    } catch (dbError) {
      console.warn('Could not sync user to Firestore (missing Service Account?):', dbError);
    }

    // Since we might not have a Service Account, we can't use createSessionCookie.
    // Instead, store the raw ID token in the cookie (expires in 1 hour).
    const cookieStore = await cookies();
    cookieStore.set('session', idToken, {
      maxAge: 60 * 60, // 1 hour
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Session creation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const cookieStore = await cookies();
    
    // Clear the cookie
    cookieStore.delete('session');
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Session deletion error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}