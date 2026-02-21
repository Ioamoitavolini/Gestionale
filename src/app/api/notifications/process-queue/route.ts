import { NextRequest, NextResponse } from 'next/server';
import { processNotificationQueue } from '@/services/notifications';

/**
 * Endpoint per processare la coda di notifiche WhatsApp
 * Da chiamare periodicamente (ogni 5-10 minuti) con un cron job
 * Per es: node-cron, Vercel Crons, AWS EventBridge, etc.
 */
export async function POST(request: NextRequest) {
  try {
    // Opzionale: verifica header di autenticazione per sicurezza
    const authHeader = request.headers.get('authorization');
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 });
    }

    await processNotificationQueue();

    return NextResponse.json({ success: true, message: 'Coda processata' });
  } catch (error) {
    console.error('Errore processing notifiche:', error);
    return NextResponse.json(
      { error: 'Errore server' },
      { status: 500 }
    );
  }
}

// Per testing, permetti GET
export async function GET(request: NextRequest) {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Non disponibile' }, { status: 403 });
  }

  try {
    await processNotificationQueue();
    return NextResponse.json({ success: true, message: 'Coda processata' });
  } catch (error) {
    console.error('Errore processing notifiche:', error);
    return NextResponse.json(
      { error: 'Errore server' },
      { status: 500 }
    );
  }
}
