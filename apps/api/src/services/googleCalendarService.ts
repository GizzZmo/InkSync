import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { prisma } from '../config/database';
import { env } from '../config/env';

function createOAuth2Client(): OAuth2Client {
  return new google.auth.OAuth2(
    env.GOOGLE_CLIENT_ID,
    env.GOOGLE_CLIENT_SECRET,
    env.GOOGLE_REDIRECT_URI
  );
}

export function getAuthUrl(): string {
  const client = createOAuth2Client();
  return client.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/calendar.events'],
    prompt: 'consent',
  });
}

export async function exchangeCodeForTokens(code: string, userId: string): Promise<void> {
  const client = createOAuth2Client();
  const { tokens } = await client.getToken(code);

  await prisma.googleCalendarToken.upsert({
    where: { userId },
    update: {
      accessToken: tokens.access_token!,
      refreshToken: tokens.refresh_token ?? '',
      expiresAt: new Date(tokens.expiry_date ?? Date.now() + 3600000),
    },
    create: {
      userId,
      accessToken: tokens.access_token!,
      refreshToken: tokens.refresh_token ?? '',
      expiresAt: new Date(tokens.expiry_date ?? Date.now() + 3600000),
    },
  });
}

async function getAuthorizedClient(userId: string): Promise<OAuth2Client | null> {
  const tokenRecord = await prisma.googleCalendarToken.findUnique({ where: { userId } });
  if (!tokenRecord) return null;

  const client = createOAuth2Client();
  client.setCredentials({
    access_token: tokenRecord.accessToken,
    refresh_token: tokenRecord.refreshToken,
    expiry_date: tokenRecord.expiresAt.getTime(),
  });

  if (tokenRecord.expiresAt < new Date()) {
    const { credentials } = await client.refreshAccessToken();
    await prisma.googleCalendarToken.update({
      where: { userId },
      data: {
        accessToken: credentials.access_token!,
        expiresAt: new Date(credentials.expiry_date ?? Date.now() + 3600000),
      },
    });
    client.setCredentials(credentials);
  }

  return client;
}

export async function createCalendarEvent(userId: string, data: {
  appointmentId: string;
  title: string;
  startTime: Date;
  endTime: Date;
  description: string;
}): Promise<string | null> {
  const client = await getAuthorizedClient(userId);
  if (!client) return null;

  const calendar = google.calendar({ version: 'v3', auth: client });
  const response = await calendar.events.insert({
    calendarId: 'primary',
    requestBody: {
      summary: data.title,
      description: data.description,
      start: { dateTime: data.startTime.toISOString() },
      end: { dateTime: data.endTime.toISOString() },
      extendedProperties: { private: { inksyncAppointmentId: data.appointmentId } },
    },
  });

  const eventId = response.data.id;
  if (eventId) {
    await prisma.appointment.update({
      where: { id: data.appointmentId },
      data: { googleCalendarEventId: eventId },
    });
  }
  return eventId ?? null;
}

export async function updateCalendarEvent(userId: string, eventId: string, data: {
  startTime?: Date;
  endTime?: Date;
  title?: string;
}): Promise<void> {
  const client = await getAuthorizedClient(userId);
  if (!client) return;

  const calendar = google.calendar({ version: 'v3', auth: client });
  await calendar.events.patch({
    calendarId: 'primary',
    eventId,
    requestBody: {
      ...(data.title ? { summary: data.title } : {}),
      ...(data.startTime ? { start: { dateTime: data.startTime.toISOString() } } : {}),
      ...(data.endTime ? { end: { dateTime: data.endTime.toISOString() } } : {}),
    },
  });
}

export async function deleteCalendarEvent(userId: string, eventId: string): Promise<void> {
  const client = await getAuthorizedClient(userId);
  if (!client) return;

  const calendar = google.calendar({ version: 'v3', auth: client });
  await calendar.events.delete({ calendarId: 'primary', eventId });
}
