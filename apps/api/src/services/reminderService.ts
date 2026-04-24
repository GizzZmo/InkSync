import cron from 'node-cron';
import { prisma } from '../config/database';
import { sendEmail } from '../utils/email';
import twilio from 'twilio';
import { env } from '../config/env';

let twilioClient: ReturnType<typeof twilio> | null = null;

function getTwilioClient() {
  if (!twilioClient && env.TWILIO_ACCOUNT_SID && env.TWILIO_AUTH_TOKEN) {
    twilioClient = twilio(env.TWILIO_ACCOUNT_SID, env.TWILIO_AUTH_TOKEN);
  }
  return twilioClient;
}

export function initReminderScheduler(): void {
  // Check for pending reminders every hour
  cron.schedule('0 * * * *', async () => {
    await processScheduledReminders();
  });

  // Schedule reminders for upcoming appointments daily at 8am
  cron.schedule('0 8 * * *', async () => {
    await scheduleUpcomingReminders();
  });

  console.log('✅ Reminder scheduler initialized');
}

async function processScheduledReminders(): Promise<void> {
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
    try {
      await sendReminder(reminder);
      await prisma.reminder.update({
        where: { id: reminder.id },
        data: { status: 'SENT', sentAt: new Date() },
      });
    } catch (err) {
      console.error(`Failed to send reminder ${reminder.id}:`, err);
      await prisma.reminder.update({
        where: { id: reminder.id },
        data: { status: 'FAILED' },
      });
    }
  }
}

async function sendReminder(reminder: any): Promise<void> {
  const { appointment } = reminder;
  const clientPhone = appointment.client.phone;

  if (reminder.type === 'SMS' && clientPhone) {
    const tc = getTwilioClient();
    if (tc && env.TWILIO_PHONE_NUMBER) {
      await tc.messages.create({
        body: reminder.message,
        from: env.TWILIO_PHONE_NUMBER,
        to: clientPhone,
      });
    }
  } else if (reminder.type === 'EMAIL') {
    await sendEmail({
      to: appointment.client.email,
      subject: 'Appointment Reminder – InkSync',
      html: `<p>${reminder.message}</p>`,
    });
  }
}

async function scheduleUpcomingReminders(): Promise<void> {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dayAfter = new Date(tomorrow);
  dayAfter.setDate(dayAfter.getDate() + 1);

  const appointments = await prisma.appointment.findMany({
    where: {
      status: 'CONFIRMED',
      startTime: { gte: tomorrow, lt: dayAfter },
      reminders: { none: { type: 'EMAIL', status: { in: ['PENDING', 'SENT'] } } },
    },
    include: { client: true, artist: { include: { user: true } } },
  });

  for (const appt of appointments) {
    const message = `Reminder: Your tattoo appointment with ${appt.artist.user.firstName} ${appt.artist.user.lastName} is tomorrow at ${appt.startTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}.`;

    await prisma.reminder.createMany({
      data: [
        {
          appointmentId: appt.id,
          type: 'EMAIL',
          scheduledAt: new Date(),
          message,
          status: 'PENDING',
        },
        ...(appt.client.phone
          ? [{
              appointmentId: appt.id,
              type: 'SMS',
              scheduledAt: new Date(),
              message,
              status: 'PENDING',
            }]
          : []),
      ],
    });
  }
}
