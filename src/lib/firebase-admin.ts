import * as admin from 'firebase-admin';

if (!admin.apps.length) {
  try {
    const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    if (serviceAccountJson) {
      const cert = JSON.parse(serviceAccountJson);
      admin.initializeApp({
        credential: admin.credential.cert(cert),
      });
    } else {
      admin.initializeApp({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'demo-project',
      });
    }
  } catch (error: any) {
    console.error('Firebase admin initialization error', error.message);
    // Fallback so build doesn't fail if env vars are malformed
    admin.initializeApp({ projectId: 'demo-project' });
  }
}

export const adminAuth = admin.auth();
export const adminDb = admin.firestore();
