/**
 * Validazione e formattazione numeri WhatsApp
 */

/**
 * Valida un numero WhatsApp in formato E.164
 * Es: +39123456789
 */
export function isValidWhatsAppNumber(number: string): boolean {
  const e164Regex = /^\+\d{1,3}\d{1,14}$/;
  return e164Regex.test(number);
}

/**
 * Converte un numero italiano a formato E.164
 * Es: 3123456789 → +393123456789
 */
export function normalizeItalianPhoneNumber(number: string): string {
  let cleaned = number.replace(/\D/g, '');

  // Se inizia con 0, rimuovilo
  if (cleaned.startsWith('0')) {
    cleaned = cleaned.slice(1);
  }

  // Se non inizia con Italia (+39), aggiungilo
  if (!cleaned.startsWith('39')) {
    cleaned = '39' + cleaned;
  }

  return '+' + cleaned;
}

/**
 * Formatta un numero per la visualizzazione
 * Es: +393123456789 → +39 312 345 6789
 */
export function formatPhoneNumberForDisplay(number: string): string {
  const cleaned = number.replace(/\D/g, '');

  if (cleaned.length === 12 && cleaned.startsWith('39')) {
    const areaCode = cleaned.slice(0, 2);
    const first = cleaned.slice(2, 5);
    const second = cleaned.slice(5, 8);
    const third = cleaned.slice(8, 12);
    return `+${areaCode} ${first} ${second} ${third}`;
  }

  return number;
}
