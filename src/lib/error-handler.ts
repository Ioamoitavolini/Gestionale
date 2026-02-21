/**
 * Utility centralizzate per error handling e logging
 */

export interface ApiError {
  code: string;
  message: string;
  statusCode: number;
  details?: any;
}

export class AppError extends Error implements ApiError {
  code: string;
  statusCode: number;
  details?: any;

  constructor(code: string, message: string, statusCode: number = 500, details?: any) {
    super(message);
    this.code = code;
    this.message = message;
    this.statusCode = statusCode;
    this.details = details;
    this.name = 'AppError';
  }
}

// Error codes
export const ErrorCodes = {
  // Auth errors (401-403)
  UNAUTHORIZED: { code: 'UNAUTHORIZED', status: 401, message: 'Non autorizzato' },
  FORBIDDEN: { code: 'FORBIDDEN', status: 403, message: 'Accesso negato' },
  INVALID_CREDENTIALS: { code: 'INVALID_CREDENTIALS', status: 401, message: 'Credenziali non valide' },
  SESSION_EXPIRED: { code: 'SESSION_EXPIRED', status: 401, message: 'Sessione scaduta' },

  // Validation errors (400)
  VALIDATION_ERROR: { code: 'VALIDATION_ERROR', status: 400, message: 'Dati non validi' },
  INVALID_EMAIL: { code: 'INVALID_EMAIL', status: 400, message: 'Email non valida' },
  INVALID_PHONE: { code: 'INVALID_PHONE', status: 400, message: 'Numero di telefono non valido' },
  INVALID_PASSWORD: { code: 'INVALID_PASSWORD', status: 400, message: 'Password non valida' },

  // Conflict errors (409)
  DUPLICATE_EMAIL: { code: 'DUPLICATE_EMAIL', status: 409, message: 'Email già in uso' },
  DUPLICATE_PHONE: { code: 'DUPLICATE_PHONE', status: 409, message: 'Numero già registrato' },
  APPOINTMENT_CONFLICT: { code: 'APPOINTMENT_CONFLICT', status: 409, message: 'Appuntamento in conflitto' },

  // Not found errors (404)
  NOT_FOUND: { code: 'NOT_FOUND', status: 404, message: 'Risorsa non trovata' },
  CLIENT_NOT_FOUND: { code: 'CLIENT_NOT_FOUND', status: 404, message: 'Cliente non trovato' },
  APPOINTMENT_NOT_FOUND: { code: 'APPOINTMENT_NOT_FOUND', status: 404, message: 'Appuntamento non trovato' },
  SERVICE_NOT_FOUND: { code: 'SERVICE_NOT_FOUND', status: 404, message: 'Servizio non trovato' },
  USER_NOT_FOUND: { code: 'USER_NOT_FOUND', status: 404, message: 'Utente non trovato' },

  // Server errors (500)
  INTERNAL_ERROR: { code: 'INTERNAL_ERROR', status: 500, message: 'Errore interno del server' },
  DATABASE_ERROR: { code: 'DATABASE_ERROR', status: 500, message: 'Errore nel database' },
  EXTERNAL_SERVICE_ERROR: { code: 'EXTERNAL_SERVICE_ERROR', status: 500, message: 'Servizio esterno non disponibile' },
} as const;

/**
 * Logger utility
 */
export const logger = {
  debug: (message: string, data?: any) => {
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[DEBUG] ${message}`, data || '');
    }
  },
  info: (message: string, data?: any) => {
    console.log(`[INFO] ${message}`, data || '');
  },
  warn: (message: string, data?: any) => {
    console.warn(`[WARN] ${message}`, data || '');
  },
  error: (message: string, error?: any) => {
    if (error && error instanceof Error) {
      console.error(`[ERROR] ${message}:`, error.message);
      if (process.env.NODE_ENV !== 'production') {
        console.error('Stack:', error.stack);
      }
    } else {
      console.error(`[ERROR] ${message}`, error || '');
    }
  },
};

/**
 * Crea AppError da error code predefinito
 */
export function createError(
  errorDef: (typeof ErrorCodes)[keyof typeof ErrorCodes],
  customMessage?: string,
  details?: any
): AppError {
  return new AppError(
    errorDef.code,
    customMessage || errorDef.message,
    errorDef.status,
    details
  );
}

/**
 * Serializza error per risposta API
 */
export function serializeError(error: unknown): ApiError {
  if (error instanceof AppError) {
    return {
      code: error.code,
      message: error.message,
      statusCode: error.statusCode,
      details: error.details,
    };
  }

  if (error instanceof Error) {
    logger.error('Uncaught error:', error);
    return {
      code: 'INTERNAL_ERROR',
      message: process.env.NODE_ENV === 'production'
        ? 'Errore interno del server'
        : error.message,
      statusCode: 500,
    };
  }

  return {
    code: 'INTERNAL_ERROR',
    message: 'Errore sconosciuto',
    statusCode: 500,
  };
}

/**
 * Validazione Zod error
 */
export function handleZodError(error: any) {
  if (error?.errors) {
    const formatted = error.errors.map((err: any) => ({
      path: err.path.join('.'),
      message: err.message,
    }));
    return createError(
      ErrorCodes.VALIDATION_ERROR,
      'Validazione dati fallita',
      formatted
    );
  }
  return createError(ErrorCodes.VALIDATION_ERROR);
}
