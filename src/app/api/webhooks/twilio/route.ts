import { prisma } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Webhook da Twilio per tracciare lo stato dei messaggi WhatsApp
 * Configura in: https://console.twilio.com/
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const messageSid = formData.get('MessageSid') as string;
    const messageStatus = formData.get('MessageStatus') as string;

    if (!messageSid || !messageStatus) {
      return NextResponse.json(
        { error: 'Parametri mancanti' },
        { status: 400 }
      );
    }

    const statusMap: Record<string, any> = {
      sent: 'SENT',
      delivered: 'DELIVERED',
      read: 'READ',
      failed: 'FAILED',
      undelivered: 'FAILED',
    };

    const notificationStatus = statusMap[messageStatus] || 'SENT';

    const notification = await prisma.notification.updateMany({
      where: { twilioSid: messageSid },
      data: {
        status: notificationStatus,
        ...(notificationStatus === 'DELIVERED' && { sentAt: new Date() }),
        ...(notificationStatus === 'READ' && { readAt: new Date() }),
      },
    });

    console.log(`✅ Stato aggiornato: ${messageSid} → ${messageStatus}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Errore webhook Twilio:', error);
    return NextResponse.json({ error: 'Errore server' }, { status: 500 });
  }
}
