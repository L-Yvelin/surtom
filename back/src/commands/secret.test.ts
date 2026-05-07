import { findSecretCommand, secretCommands } from './secret.js';

describe('secretCommands', () => {
  it('exports at least one secret command', () => {
    expect(secretCommands.length).toBeGreaterThan(0);
  });

  it('every secret has a hash and a payload containing the {{command}} placeholder', () => {
    secretCommands.forEach((sc) => {
      expect(typeof sc.hash).toBe('string');
      expect(sc.hash.startsWith('$2')).toBe(true);
      expect(sc.payload).toContain('{{command}}');
    });
  });
});

describe('findSecretCommand', () => {
  it('returns undefined for an unknown name', () => {
    expect(findSecretCommand('definitely-not-a-secret-command-xyz')).toBeUndefined();
  });
});
