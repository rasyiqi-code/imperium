import { prisma } from './prisma';

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  try {
    // 1. Ambil pengaturan email dari database menggunakan Prisma
    const settings = await prisma.admin_settings.findUnique({
      where: { id: 1 },
      select: {
        email_notif_active: true,
        resend_api_key: true,
        resend_sender_email: true,
      }
    });

    if (!settings) {
      console.error('Gagal memuat pengaturan email: Pengaturan tidak ditemukan.');
      return;
    }

    if (!settings.email_notif_active) {
      console.log('Email notifications are disabled in settings.');
      return;
    }

    const apiKey = settings.resend_api_key;
    const sender = settings.resend_sender_email || 'onboarding@resend.dev'; // Default sandbox sender

    if (!apiKey) {
      console.warn('Resend API key is not configured in admin settings.');
      return;
    }

    // 2. Send email via Resend REST API (avoids requiring third-party resend npm package)
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `Imperium Crypto <${sender}>`,
        to: [to],
        subject: subject,
        html: html,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error('Failed to send email via Resend:', errText);
    } else {
      console.log(`Email successfully sent to ${to}`);
    }
  } catch (err) {
    console.error('Error in sendEmail:', err);
  }
}
