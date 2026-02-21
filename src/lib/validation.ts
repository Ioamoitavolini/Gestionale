import { z } from 'zod';

/**
 * Validazione centralizzata per il progetto
 */

// ===== PATTERNS =====
const E164_PHONE_PATTERN = /^\+\d{1,3}\d{1,14}$/;
const ITALIAN_PHONE_PATTERN = /^(?:(?:\+|00)39)?3\d{8}$|^(?:(?:\+|00)39)?0\d{8,9}$/;

// ===== CUSTOM VALIDATORS =====

export const phoneValidation = z
  .string()
  .min(10, 'Numero di telefono non valido')
  .refine(
    (val) => E164_PHONE_PATTERN.test(val),
    'Deve essere in formato E.164 (+39XXXXXXXXX)'
  );

export const emailValidation = z
  .string()
  .email('Email non valida')
  .toLowerCase()
  .refine(
    (val) => !val.endsWith('@example.com'),
    'Email di test non consentita'
  );

export const passwordValidation = z
  .string()
  .min(8, 'La password deve avere almeno 8 caratteri')
  .regex(/[A-Z]/, 'La password deve contere almeno una maiuscola')
  .regex(/[a-z]/, 'La password deve contere almeno una minuscola')
  .regex(/\d/, 'La password deve contere almeno un numero');

export const appointmentTimeValidation = z.object({
  startTime: z.coerce.date(),
  endTime: z.coerce.date(),
}).refine(
  (data) => data.startTime < data.endTime,
  {
    message: 'L\'orario di fine deve essere dopo l\'inizio',
    path: ['endTime'],
  }
).refine(
  (data) => {
    const start = new Date(data.startTime);
    const now = new Date();
    return start > now;
  },
  {
    message: 'Non è possibile prenotare nel passato',
    path: ['startTime'],
  }
);

// ===== SCHEMAS =====

export const clientSchema = z.object({
  firstName: z.string().min(1, 'Nome richiesto').max(100),
  lastName: z.string().min(1, 'Cognome richiesto').max(100),
  email: emailValidation.optional().or(z.literal('')),
  phone: z.string().min(10, 'Numero di telefono non valido'),
  whatsappNumber: phoneValidation,
  address: z.string().max(255).optional().or(z.literal('')),
  city: z.string().max(100).optional().or(z.literal('')),
  postalCode: z.string().regex(/^\d{5}$/, 'CAP non valido').optional().or(z.literal('')),
  dateOfBirth: z.coerce.date().optional(),
  notes: z.string().max(500).optional().or(z.literal('')),
});

export const clientUpdateSchema = clientSchema.partial();

export const appointmentSchema = z.object({
  clientId: z.string().cuid('ID cliente non valido'),
  userId: z.string().cuid('ID provider non valido'),
  serviceId: z.string().cuid('ID servizio non valido'),
  title: z.string().min(1, 'Titolo richiesto'),
  description: z.string().optional(),
  startTime: z.coerce.date(),
  endTime: z.coerce.date(),
  price: z.number().positive().optional(),
  notes: z.string().max(500).optional(),
}).merge(appointmentTimeValidation);

export const appointmentUpdateSchema = appointmentSchema.partial();

export const serviceSchema = z.object({
  name: z.string().min(1, 'Nome servizio richiesto').max(100),
  description: z.string().max(500).optional(),
  duration: z.number().int().positive('Durata deve essere positiva'),
  price: z.number().positive('Prezzo deve essere positivo'),
  active: z.boolean().default(true),
});

export const serviceUpdateSchema = serviceSchema.partial();

export const userSchema = z.object({
  email: emailValidation,
  password: passwordValidation,
  name: z.string().min(1, 'Nome richiesto').max(100),
  role: z.enum(['ADMIN', 'RECEPTIONIST']).default('RECEPTIONIST'),
});

export const loginSchema = z.object({
  email: emailValidation,
  password: z.string().min(1, 'Password richiesta'),
});

export const notificationSchema = z.object({
  appointmentId: z.string().cuid(),
  message: z.string().min(1, 'Messaggio richiesto'),
  type: z.enum([
    'REMINDER_24H',
    'REMINDER_1H',
    'CONFIRMATION',
    'CANCELLATION',
    'RESCHEDULE',
  ]),
});

// ===== TYPE EXPORTS =====
export type Client = z.infer<typeof clientSchema>;
export type ClientUpdate = z.infer<typeof clientUpdateSchema>;
export type Appointment = z.infer<typeof appointmentSchema>;
export type AppointmentUpdate = z.infer<typeof appointmentUpdateSchema>;
export type Service = z.infer<typeof serviceSchema>;
export type ServiceUpdate = z.infer<typeof serviceUpdateSchema>;
export type User = z.infer<typeof userSchema>;
export type Login = z.infer<typeof loginSchema>;
export type Notification = z.infer<typeof notificationSchema>;
