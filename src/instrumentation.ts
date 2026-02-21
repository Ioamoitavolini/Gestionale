import { initializeCronJobs } from '@/lib/cron';

// Inizializza i cron job solo in development/production
if (process.env.NODE_ENV !== 'test') {
  if (typeof window === 'undefined') {
    // Server-only initialization
    initializeCronJobs();
  }
}
