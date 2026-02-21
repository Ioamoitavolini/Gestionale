import cron from 'node-cron';
import { processNotificationQueue, cleanupOldNotifications } from '@/services/notifications';

/**
 * Inizializza i cron job per il gestionale
 * 
 * - Processa coda notifiche: ogni 5 minuti
 * - (Future) Cleanup notifiche vecchie: ogni giorno a mezzanotte
 */

export function initializeCronJobs() {
  console.log('📅 Inizializzazione cron job...');

  /**
   * Processa la coda di notifiche WhatsApp ogni 5 minuti
   * Formato: "*/5 * * * *" = ogni 5 minuti
   */
  const notificationCron = cron.schedule('*/5 * * * *', async () => {
    try {
      console.log('⏰ Processando coda notifiche WhatsApp...');
      await processNotificationQueue();
      console.log('✅ Coda notifiche processata');
    } catch (error) {
      console.error('❌ Errore processing notifiche:', error);
    }
  });

  /**
   * Cleanup notifiche vecchie (più di 90 giorni)
   * Ogni giorno a mezzanotte
   * Formato: "0 0 * * *" = mezzanotte
   */
  const cleanupCron = cron.schedule('0 0 * * *', async () => {
    try {
      console.log('🧹 Pulizia notifiche vecchie...');
      await cleanupOldNotifications();
      console.log('✅ Pulizia completata');
    } catch (error) {
      console.error('❌ Errore cleanup:', error);
    }
  });

  // Arresta i cron job al shutdown
  const stop = () => {
    notificationCron.stop();
    cleanupCron.stop();
    console.log('🛑 Cron job interrotti');
  };

  return { stop };
}

// Tipo per il controllo dei cron job
export type CronController = ReturnType<typeof initializeCronJobs>;
