import { getAvailableCommands } from './availableCommands.js';

describe('getAvailableCommands', () => {
  it('returns the base 4 commands plus /refresh for non-moderators', () => {
    const cmds = getAvailableCommands(false);
    expect(Object.keys(cmds)).toEqual(
      expect.arrayContaining(['/register pseudo mot_de_passe', '/login pseudo mot_de_passe', '/msg cible message', '/help', '/refresh']),
    );
  });

  it('exposes the moderator-only commands when isModerator=true', () => {
    const cmds = getAvailableCommands(true);
    expect(Object.keys(cmds)).toEqual(expect.arrayContaining(['/refresh cible?', '/mod mot_de_passe', '/addtype type', '/eval ¿¿¿ ¿¿¿¿']));
  });

  it('does not expose moderator commands to non-moderators', () => {
    const cmds = getAvailableCommands(false);
    expect(cmds['/mod mot_de_passe']).toBeUndefined();
    expect(cmds['/addtype type']).toBeUndefined();
    expect(cmds['/eval ¿¿¿ ¿¿¿¿']).toBeUndefined();
  });
});
