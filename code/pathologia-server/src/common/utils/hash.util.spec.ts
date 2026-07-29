import { compareHash, hashValue } from './hash.util';

describe('hash.util', () => {
  it('should hash and compare passwords correctly', async () => {
    const password = 'TestPass1!';
    const hash = await hashValue(password);

    expect(hash).not.toBe(password);
    await expect(compareHash(password, hash)).resolves.toBe(true);
    await expect(compareHash('WrongPass1!', hash)).resolves.toBe(false);
  });
});
