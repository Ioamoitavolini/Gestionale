import { Twilio } from 'twilio';
import { prisma } from '@/lib/db';

const twilio = new Twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const TWILIO_WHATSAPP_NUMBER = process.env.TWILIO_WHATSAPP_NUMBER || 'whatsapp:+1234567890';

/**
 * Invia un messaggio WhatsApp tramite Twilio
 * @param toNumber Numero destinatario in formato E.164 (es: +39xxxxxxxxx)
 * @param message Contenuto del messaggio
 * @returns SID del messaggio o null se fallisce
 */
export async function sendWhatsAppMessage(
  toNumber: string,
  message: string
): Promise<string | null> {
  try {
    const response = await twilio.messages.create({
      from: TWILIO_WHATSAPP_NUMBER,
      to: `whatsapp:${toNumber}`,
      body: message,
    });

    return response.sid;
  } catch (error) {
    console.error('Errore invio WhatsApp:', error);
    throw error;
  }
}

/**
 * Crea un promemoria 24 ore prima dell'appuntamento
 */
export async function createAppointmentReminder(appointmentId: string) {
  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    include: {
      client: true,
      service: true,
      provider: true,
    },
  });

  if (!appointment) throw new Error('Appuntamento non trovato');

  const message = `Ciao ${appointment.client.firstName}! 👋\nRicordati del tuo appuntamento di ${appointment.service.name} domani alle ${new Date(appointment.startTime).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}. Non vediamo l'ora! 💅`;

  const notification = await prisma.notification.create({
    data: {
      appointmentId,
      userId: appointment.userId,
      clientId: appointment.clientId,
      type: 'REMINDER_24H',
      message,
      status: 'QUEUED',
    },
  });

  return notification;
}

/**
 * Processa la coda di notifiche in attesa
 * (da eseguire periodicamente, es: via cron job)
 */
export async function processNotificationQueue() {
  const pendingNotifications = await prisma.notification.findMany({
    where: {
      status: 'QUEUED',
      retryCount: { lt: 3 }, // max 3 tentativi
    },
    include: { appointment: { include: { client: true } } },
    take: 10, // Processa fino a 10 alla volta
  });

  for (const notification of pendingNotifications) {
    try {
      await prisma.notification.update({
        where: { id: notification.id },
        data: { status: 'SENDING' },
      });

      const twilioSid = await sendWhatsAppMessage(
        notification.appointment.client.whatsappNumber,
        notification.message
      );

      await prisma.notification.update({
        where: { id: notification.id },
        data: {
          status: 'SENT',
          sentAt: new Date(),
          twilioSid,
        },
      });

      console.log(`✅ Notifica inviata: ${notification.id}`);
    } catch (error) {
      console.error(`❌ Errore notifica ${notification.id}:`, error);

      await prisma.notification.update({
        where: { id: notification.id },
        data: {
          status: 'FAILED',
          retryCount: { increment: 1 },
          failureReason: `${error}`,
        },
      });
    }
  }
}

/**
 * Programma un promemoria per un appuntamento futuro
 */
export async function scheduleAppointmentReminder(appointmentId: string) {
  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
  });

  if (!appointment) throw new Error('Appuntamento non trovato');

  const reminderTime = new Date(appointment.startTime);
  reminderTime.setHours(reminderTime.getHours() - 24); // 24 ore prima

  const now = new Date();
  const delay = reminderTime.getTime() - now.getTime();

  if (delay > 0) {
    // In produzione, usare un job queue (Bull, RQ, Celery)
    setTimeout(
      () => createAppointmentReminder(appointmentId),
      delay
    );
  }
}

/**
 * Soft-delete notifiche più vecchie di 90 giorni
 */
export async function cleanupOldNotifications() {
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

  const result = await prisma.notification.updateMany({
    where: {
      createdAt: { lt: ninetyDaysAgo },
      deletedAt: null, // Solo notifiche non ancora eliminate
    },
    data: {
      deletedAt: new Date(),
    },
  });

  console.log(`🧹 Pulite ${result.count} notifiche vecchie`);
  return result.count;
}
