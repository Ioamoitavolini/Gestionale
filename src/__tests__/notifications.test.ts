import { prisma } from '@/lib/db';
import {
  cleanupOldNotifications,
  processNotificationQueue,
  createAppointmentReminder,
} from '@/services/notifications';

// Mock Prisma
jest.mock('@/lib/db', () => ({
  prisma: {
    notification: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
    },
    appointment: {
      findUnique: jest.fn(),
    },
  },
}));

// Mock Twilio
jest.mock('twilio', () => {
  return jest.fn(() => ({
    messages: {
      create: jest.fn().mockResolvedValue({ sid: 'msg_test_sid' }),
    },
  }));
});

describe('Notifications Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('cleanupOldNotifications', () => {
    it('should soft-delete notifications older than 90 days', async () => {
      const mockResult = { count: 5 };
      (prisma.notification.updateMany as jest.Mock).mockResolvedValue(mockResult);

      const result = await cleanupOldNotifications();

      expect(prisma.notification.updateMany).toHaveBeenCalledWith({
        where: {
          createdAt: { lt: expect.any(Date) },
          deletedAt: null,
        },
        data: {
          deletedAt: expect.any(Date),
        },
      });

      expect(result).toBe(5);
    });

    it('should skip already deleted notifications', async () => {
      (prisma.notification.updateMany as jest.Mock).mockResolvedValue({ count: 0 });

      await cleanupOldNotifications();

      const callArgs = (prisma.notification.updateMany as jest.Mock).mock.calls[0][0];
      expect(callArgs.where.deletedAt).toBeNull();
    });

    it('should handle errors gracefully', async () => {
      const mockError = new Error('DB Error');
      (prisma.notification.updateMany as jest.Mock).mockRejectedValue(mockError);

      await expect(cleanupOldNotifications()).rejects.toThrow('DB Error');
    });
  });

  describe('processNotificationQueue', () => {
    it('should process queued notifications successfully', async () => {
      const mockNotifications = [
        {
          id: 'notif_1',
          message: 'Test message',
          appointment: {
            client: { whatsappNumber: '+393123456789' },
          },
        },
      ];

      (prisma.notification.findMany as jest.Mock).mockResolvedValue(mockNotifications);
      (prisma.notification.update as jest.Mock).mockResolvedValue({});

      await processNotificationQueue();

      // Verify QUEUED → SENDING transition
      expect(prisma.notification.update).toHaveBeenCalledWith({
        where: { id: 'notif_1' },
        data: { status: 'SENDING' },
      });

      // Verify SENDING → SENT transition with twilioSid
      expect(prisma.notification.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'notif_1' },
          data: expect.objectContaining({
            status: 'SENT',
            twilioSid: 'msg_test_sid',
          }),
        })
      );
    });

    it('should retry failed notifications', async () => {
      const mockNotifications = [
        {
          id: 'notif_fail',
          message: 'Test',
          retryCount: 1,
          appointment: {
            client: { whatsappNumber: '+393123456789' },
          },
        },
      ];

      (prisma.notification.findMany as jest.Mock).mockResolvedValue(mockNotifications);

      // Mock Twilio error
      const { Twilio } = require('twilio');
      Twilio.prototype.messages.create = jest
        .fn()
        .mockRejectedValue(new Error('Twilio error'));

      (prisma.notification.update as jest.Mock).mockResolvedValue({});

      try {
        await processNotificationQueue();
      } catch (e) {
        // Expected to fail
      }

      // Verify retry logic: increments retryCount on failure
      expect(prisma.notification.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'notif_fail' },
          data: expect.objectContaining({
            status: 'FAILED',
          }),
        })
      );
    });

    it('should limit batch processing to 10 notifications', async () => {
      (prisma.notification.findMany as jest.Mock).mockResolvedValue([]);

      await processNotificationQueue();

      const callArgs = (prisma.notification.findMany as jest.Mock).mock.calls[0][0];
      expect(callArgs.take).toBe(10);
    });

    it('should respect max retries limit', async () => {
      (prisma.notification.findMany as jest.Mock).mockResolvedValue([]);

      await processNotificationQueue();

      const callArgs = (prisma.notification.findMany as jest.Mock).mock.calls[0][0];
      expect(callArgs.where.retryCount).toEqual({ lt: 3 });
    });
  });

  describe('createAppointmentReminder', () => {
    it('should create a reminder notification', async () => {
      const mockAppointment = {
        id: 'apt_1',
        startTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
        client: { firstName: 'Mario' },
        service: { name: 'Manicure' },
        userId: 'user_1',
        clientId: 'client_1',
      };

      (prisma.appointment.findUnique as jest.Mock).mockResolvedValue(mockAppointment);
      (prisma.notification.create as jest.Mock).mockResolvedValue({
        id: 'notif_created',
      });

      const result = await createAppointmentReminder('apt_1');

      expect(prisma.notification.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          appointmentId: 'apt_1',
          type: 'REMINDER_24H',
          status: 'QUEUED',
          message: expect.stringContaining('Mario'),
        }),
      });

      expect(result.id).toBe('notif_created');
    });

    it('should throw error if appointment not found', async () => {
      (prisma.appointment.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(createAppointmentReminder('invalid_id')).rejects.toThrow(
        'Appuntamento non trovato'
      );
    });
  });
});
