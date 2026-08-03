import {
  DEFAULT_PASSWORD_POLICY,
  getStrongPasswordMessage,
  isStrongPassword,
} from './is-strong-password.decorator';

describe('is-strong-password.decorator', () => {
  describe('isStrongPassword', () => {
    it('accepts valid passwords', () => {
      expect(isStrongPassword('Abcdef1@')).toBe(true);
      expect(isStrongPassword('ValidPass1!')).toBe(true);
      expect(isStrongPassword('Zz9#extra')).toBe(true);
    });

    it('rejects passwords shorter than minLength', () => {
      expect(isStrongPassword('Ab1@')).toBe(false);
      expect(isStrongPassword('Abcd1@x')).toBe(false);
    });

    it('rejects passwords missing uppercase', () => {
      expect(isStrongPassword('abcdef1@')).toBe(false);
    });

    it('rejects passwords missing lowercase', () => {
      expect(isStrongPassword('ABCDEF1@')).toBe(false);
    });

    it('rejects passwords missing a digit', () => {
      expect(isStrongPassword('Abcdefg@')).toBe(false);
    });

    it('rejects passwords missing a configured special character', () => {
      expect(isStrongPassword('Abcdef12')).toBe(false);
    });

    it('rejects characters outside the allowed special-character set', () => {
      expect(isStrongPassword('Abcdef1^')).toBe(false);
      expect(isStrongPassword('Abcdef1~')).toBe(false);
    });

    it('rejects spaces', () => {
      expect(isStrongPassword('Abc def1@')).toBe(false);
      expect(isStrongPassword('Abcdef1@ ')).toBe(false);
    });

    it('rejects emojis', () => {
      expect(isStrongPassword('Abcdef1@😀')).toBe(false);
    });

    it('rejects Unicode letters', () => {
      expect(isStrongPassword('Abcdef1@é')).toBe(false);
      expect(isStrongPassword('Ábcdef1@')).toBe(false);
    });

    it('accepts passwords at the minimum length boundary', () => {
      expect(isStrongPassword('Abcd1@xy')).toBe(true);
    });

    it('rejects passwords one character below the minimum length', () => {
      expect(isStrongPassword('Abcd1@x')).toBe(false);
    });

    it('applies custom password policies', () => {
      const customPolicy = { minLength: 12, specialChars: '!' } as const;

      expect(isStrongPassword('abcdefghijKl1!', customPolicy)).toBe(true);
      expect(isStrongPassword('abcdefghijKl1', customPolicy)).toBe(false);
      expect(isStrongPassword('abcdefghijkl1!', customPolicy)).toBe(false);
      expect(isStrongPassword('abcdefghijkl1@', customPolicy)).toBe(false);
    });

    it('reuses compiled policy data for repeated custom policy validation', () => {
      const customPolicy = { minLength: 10, specialChars: '#$' };

      for (let i = 0; i < 100; i++) {
        expect(isStrongPassword('Abcdefghij1#', customPolicy)).toBe(true);
      }
    });
  });

  describe('getStrongPasswordMessage', () => {
    it('includes minimum length and allowed special characters for the default policy', () => {
      const message = getStrongPasswordMessage();

      expect(message).toContain(String(DEFAULT_PASSWORD_POLICY.minLength));
      expect(message).toContain(DEFAULT_PASSWORD_POLICY.specialChars);
      expect(message).toMatch(/uppercase/i);
      expect(message).toMatch(/lowercase/i);
      expect(message).toMatch(/digit/i);
    });

    it('reflects custom policy values', () => {
      const customPolicy = { minLength: 12, specialChars: '!@' };
      const message = getStrongPasswordMessage(customPolicy);

      expect(message).toContain('12');
      expect(message).toContain('!@');
    });
  });
});
