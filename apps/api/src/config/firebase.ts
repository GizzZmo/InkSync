import * as admin from 'firebase-admin';
import { env } from './env';

let firebaseApp: admin.app.App | null = null;

export function getFirebaseApp(): admin.app.App {
  if (!firebaseApp && env.FIREBASE_PROJECT_ID) {
    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert({
        projectId: env.FIREBASE_PROJECT_ID,
        privateKey: env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        clientEmail: env.FIREBASE_CLIENT_EMAIL,
      }),
    });
  }
  if (!firebaseApp) {
    throw new Error('Firebase not configured');
  }
  return firebaseApp;
}

export async function sendPushNotification(
  fcmToken: string,
  title: string,
  body: string,
  data?: Record<string, string>
): Promise<void> {
  const app = getFirebaseApp();
  await admin.messaging(app).send({
    token: fcmToken,
    notification: { title, body },
    data,
  });
}
