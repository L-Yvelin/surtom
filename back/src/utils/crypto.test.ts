import bcrypt from 'bcrypt';
import { generateRandomHash, passwordInHashArray } from './crypto.js';

describe('generateRandomHash', () => {
  it('returns a 32-character hex string (16 random bytes)', () => {
    const hash = generateRandomHash();
    expect(hash).toMatch(/^[0-9a-f]{32}$/);
  });

  it('returns a different value on consecutive calls', () => {
    const hashes = new Set([generateRandomHash(), generateRandomHash(), generateRandomHash(), generateRandomHash()]);
    expect(hashes.size).toBe(4);
  });
});

describe('passwordInHashArray', () => {
  const password = 'secret-password';
  let validHash: string;

  beforeAll(() => {
    validHash = bcrypt.hashSync(password, 4);
  });

  it('returns true when password matches one of the hashes', () => {
    expect(passwordInHashArray(password, [validHash])).toBe(true);
  });

  it('returns true when password matches any of multiple hashes', () => {
    const otherHash = bcrypt.hashSync('different', 4);
    expect(passwordInHashArray(password, [otherHash, validHash])).toBe(true);
  });

  it('returns false when password matches none of the hashes', () => {
    const otherHash = bcrypt.hashSync('different', 4);
    expect(passwordInHashArray('wrong', [otherHash, validHash])).toBe(false);
  });

  it('returns false on empty hash list', () => {
    expect(passwordInHashArray(password, [])).toBe(false);
  });
});
