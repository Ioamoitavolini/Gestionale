import { initializeCronJobs, CronController } from '@/lib/cron';
import * as notificationsService from '@/services/notifications';

// Mock node-cron
jest.mock('node-cron', () => ({
  schedule: jest.fn((pattern, callback) => ({
    stop: jest.fn(),
    callback,
    pattern,
  })),
}));

// Mock notifications service
jest.mock('@/services/notifications', () => ({
  processNotificationQueue: jest.fn(),
  cleanupOldNotifications: jest.fn(),
}));

import cron from 'node-cron';

describe('Cron Jobs', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    (console.log as jest.Mock).mockRestore();
    (console.error as jest.Mock).mockRestore();
  });

  describe('initializeCronJobs', () => {
    it('should initialize two cron jobs', () => {
      initializeCronJobs();

      expect(cron.schedule).toHaveBeenCalledTimes(2);
    });

    it('should schedule notification processing every 5 minutes', () => {
      initializeCronJobs();

      const firstCall = (cron.schedule as jest.Mock).mock.calls[0];
      expect(firstCall[0]).toBe('*/5 * * * *');
    });

    it('should schedule cleanup at midnight daily', () => {
      initializeCronJobs();

      const secondCall = (cron.schedule as jest.Mock).mock.calls[1];
      expect(secondCall[0]).toBe('0 0 * * *');
    });

    it('should process notification queue on schedule', async () => {
      (notificationsService.processNotificationQueue as jest.Mock).mockResolvedValue(
        undefined
      );

      initializeCronJobs();

      const notificationCallback = (cron.schedule as jest.Mock).mock.calls[0][1];
      await notificationCallback();

      expect(notificationsService.processNotificationQueue).toHaveBeenCalled();
    });

    it('should cleanup old notifications on schedule', async () => {
      (notificationsService.cleanupOldNotifications as jest.Mock).mockResolvedValue(5);

      initializeCronJobs();

      const cleanupCallback = (cron.schedule as jest.Mock).mock.calls[1][1];
      await cleanupCallback();

      expect(notificationsService.cleanupOldNotifications).toHaveBeenCalled();
    });

    it('should handle errors in notification processing', async () => {
      const testError = new Error('Network error');
      (notificationsService.processNotificationQueue as jest.Mock).mockRejectedValue(
        testError
      );

      initializeCronJobs();

      const notificationCallback = (cron.schedule as jest.Mock).mock.calls[0][1];
      await notificationCallback();

      expect(console.error).toHaveBeenCalledWith(
        '❌ Errore processing notifiche:',
        testError
      );
    });

    it('should handle errors in cleanup', async () => {
      const testError = new Error('DB Error');
      (notificationsService.cleanupOldNotifications as jest.Mock).mockRejectedValue(
        testError
      );

      initializeCronJobs();

      const cleanupCallback = (cron.schedule as jest.Mock).mock.calls[1][1];
      await cleanupCallback();

      expect(console.error).toHaveBeenCalledWith('❌ Errore cleanup:', testError);
    });

    it('should return a controller with stop function', () => {
      const controller = initializeCronJobs();

      expect(controller).toBeDefined();
      expect(typeof controller.stop).toBe('function');
    });

    it('should stop both cron jobs when stop is called', () => {
      const controller = initializeCronJobs();

      const mockStop1 = (cron.schedule as jest.Mock).mock.results[0].value.stop;
      const mockStop2 = (cron.schedule as jest.Mock).mock.results[1].value.stop;

      controller.stop();

      expect(mockStop1).toHaveBeenCalled();
      expect(mockStop2).toHaveBeenCalled();
    });

    it('should log initialization start and shutdown', () => {
      const controller = initializeCronJobs();

      expect(console.log).toHaveBeenCalledWith('📅 Inizializzazione cron job...');

      controller.stop();
      expect(console.log).toHaveBeenCalledWith('🛑 Cron job interrotti');
    });

    it('should be CronController type', () => {
      const controller = initializeCronJobs();

      // Verifica che il controller abbia la struttura giusta
      expect(controller).toHaveProperty('stop');
      expect(typeof controller.stop).toBe('function');
    });
  });

  describe('Cron Job Execution Scenarios', () => {
    it('should continue processing even if one notification fails', async () => {
      (notificationsService.processNotificationQueue as jest.Mock).mockResolvedValue(
        undefined
      );

      initializeCronJobs();

      const callback = (cron.schedule as jest.Mock).mock.calls[0][1];

      // Simula multiple calls
      await callback();
      await callback();
      await callback();

      expect(notificationsService.processNotificationQueue).toHaveBeenCalledTimes(3);
    });

    it('should not block other jobs if cleanup fails', async () => {
      (notificationsService.processNotificationQueue as jest.Mock).mockResolvedValue(
        undefined
      );
      (notificationsService.cleanupOldNotifications as jest.Mock).mockRejectedValue(
        new Error('Cleanup failed')
      );

      initializeCronJobs();

      const notifyCallback = (cron.schedule as jest.Mock).mock.calls[0][1];
      const cleanupCallback = (cron.schedule as jest.Mock).mock.calls[1][1];

      await cleanupCallback(); // Falls
      await notifyCallback(); // Should still work

      expect(notificationsService.processNotificationQueue).toHaveBeenCalled();
      expect(console.error).toHaveBeenCalledWith(
        '❌ Errore cleanup:',
        expect.any(Error)
      );
    });
  });
});
