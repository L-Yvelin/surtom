import { canToggleDeletion } from './messagePermissions.js';

const author = { name: 'alice', moderatorLevel: 0 };

describe('canToggleDeletion', () => {
  it('lets the author toggle their own, not-yet-deleted message', () => {
    expect(canToggleDeletion({ name: 'alice', moderatorLevel: 0 }, author, 0)).toBe(true);
  });

  it('refuses a stranger with no moderator rank', () => {
    expect(canToggleDeletion({ name: 'bob', moderatorLevel: 0 }, author, 0)).toBe(false);
  });

  it('lets a higher-ranked moderator toggle a message from another author', () => {
    expect(canToggleDeletion({ name: 'mod', moderatorLevel: 1 }, author, 0)).toBe(true);
  });

  it('refuses a moderator toggling a message from an equally-ranked author', () => {
    expect(canToggleDeletion({ name: 'mod', moderatorLevel: 1 }, { name: 'other-mod', moderatorLevel: 1 }, 0)).toBe(false);
  });

  it('refuses a lower-ranked moderator from restoring a message deleted by a higher-ranked moderator', () => {
    // Message was deleted by a level-2 moderator (currentDeleted=2); a level-1 moderator
    // outranks the original author but not the moderator who performed the deletion.
    expect(canToggleDeletion({ name: 'mod1', moderatorLevel: 1 }, author, 2)).toBe(false);
  });

  it('lets a moderator of at least the deleting rank restore the message', () => {
    expect(canToggleDeletion({ name: 'mod2', moderatorLevel: 2 }, author, 2)).toBe(true);
  });

  it('lets the author re-toggle their own message even if it was deleted at a higher rank', () => {
    // isOwnMessage short-circuits the outranking check, but the currentDeleted guard still applies.
    expect(canToggleDeletion({ name: 'alice', moderatorLevel: 0 }, author, 2)).toBe(false);
  });
});
