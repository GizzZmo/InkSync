import { prisma } from '../config/database';
import { sendPushNotification } from '../config/firebase';

export async function getNotificationPreferences(userId: string) {
  const prefs = await prisma.notificationPreference.findUnique({ where: { userId } });
  if (!prefs) {
    return {
      userId,
      emailEnabled: true,
      smsEnabled: true,
      pushEnabled: true,
      appointmentReminders: true,
      marketingEmails: false,
      aftercareReminders: true,
      paymentNotifications: true,
      fcmToken: null,
    };
  }
  return prefs;
}

export async function updateNotificationPreferences(userId: string, data: {
  emailEnabled?: boolean;
  smsEnabled?: boolean;
  pushEnabled?: boolean;
  appointmentReminders?: boolean;
  marketingEmails?: boolean;
  aftercareReminders?: boolean;
  paymentNotifications?: boolean;
  fcmToken?: string;
}) {
  return prisma.notificationPreference.upsert({
    where: { userId },
    update: data,
    create: { userId, ...data },
  });
}

export async function sendPushToUser(userId: string, title: string, body: string, data?: Record<string, string>): Promise<void> {
  const prefs = await prisma.notificationPreference.findUnique({ where: { userId } });
  if (!prefs?.pushEnabled || !prefs.fcmToken) return;

  await sendPushNotification(prefs.fcmToken, title, body, data).catch(console.error);
}
