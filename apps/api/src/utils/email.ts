import nodemailer from 'nodemailer';
import { env } from '../config/env';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

function createTransporter() {
  if (env.SENDGRID_API_KEY) {
    return nodemailer.createTransport({
      service: 'SendGrid',
      auth: {
        user: 'apikey',
        pass: env.SENDGRID_API_KEY,
      },
    });
  }
  // Fallback for development
  return nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: { user: 'test', pass: 'test' },
  });
}

export async function sendEmail(options: EmailOptions): Promise<void> {
  const transporter = createTransporter();
  await transporter.sendMail({
    from: env.EMAIL_FROM,
    ...options,
  });
}

export function getVerificationEmailHtml(firstName: string, verifyUrl: string): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Verify your InkSync account</h2>
      <p>Hi ${firstName},</p>
      <p>Click the button below to verify your email address:</p>
      <a href="${verifyUrl}" style="background: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
        Verify Email
      </a>
      <p>This link expires in 24 hours.</p>
    </div>
  `;
}

export function getPasswordResetEmailHtml(firstName: string, resetUrl: string): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Reset your InkSync password</h2>
      <p>Hi ${firstName},</p>
      <p>Click the button below to reset your password:</p>
      <a href="${resetUrl}" style="background: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
        Reset Password
      </a>
      <p>This link expires in 1 hour. If you didn't request a reset, ignore this email.</p>
    </div>
  `;
}

export function getAppointmentConfirmationEmailHtml(
  clientName: string,
  artistName: string,
  date: string,
  time: string
): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Appointment Confirmed – InkSync</h2>
      <p>Hi ${clientName},</p>
      <p>Your appointment with <strong>${artistName}</strong> has been confirmed.</p>
      <p><strong>Date:</strong> ${date}</p>
      <p><strong>Time:</strong> ${time}</p>
      <p>We'll send you a reminder 24 hours before your appointment.</p>
    </div>
  `;
}
