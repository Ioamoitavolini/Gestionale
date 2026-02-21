import { isValidWhatsAppNumber, normalizeItalianPhoneNumber } from '@/lib/phone-utils';

describe('Phone Utils', () => {
  describe('isValidWhatsAppNumber', () => {
    it('should validate correct E.164 format numbers', () => {
      expect(isValidWhatsAppNumber('+393123456789')).toBe(true);
      expect(isValidWhatsAppNumber('+39321987654')).toBe(true);
    });

    it('should reject invalid formats', () => {
      expect(isValidWhatsAppNumber('3123456789')).toBe(false);
      expect(isValidWhatsAppNumber('+39')).toBe(false);
      expect(isValidWhatsAppNumber('invalid')).toBe(false);
    });
  });

  describe('normalizeItalianPhoneNumber', () => {
    it('should convert Italian numbers to E.164 format', () => {
      expect(normalizeItalianPhoneNumber('3123456789')).toBe('+393123456789');
      expect(normalizeItalianPhoneNumber('0312345678')).toBe('+393912345678');
    });

    it('should handle already normalized numbers', () => {
      expect(normalizeItalianPhoneNumber('+393123456789')).toBe('+393123456789');
    });
  });
});
