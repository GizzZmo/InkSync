import cron from 'node-cron';
import { prisma } from '../config/database';

export function initReminderScheduler(): void {
  // Run every minute to check for pending reminders
  cron.schedule('* * * * *', async () => {
    try {
      const now = new Date();
      const pending = await prisma.reminder.findMany({
        where: {
          status: 'PENDING',
          scheduledAt: { lte: now },
        },
        include: {
          appointment: {
            include: {
              client: true,
              artist: { include: { user: true } },
            },
          },
        },
        take: 50,
      });

      for (const reminder of pending) {
        await prisma.reminder.update({
          where: { id: reminder.id },
          data: { status: 'SENT', sentAt: now },
        });
        // Notification dispatch handled by notification service
      }
    } catch (err) {
      console.error('Reminder scheduler error:', err);
    }
  });

  console.log('✅ Reminder scheduler initialized');
}
