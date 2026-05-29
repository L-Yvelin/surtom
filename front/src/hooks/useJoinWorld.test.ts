import { Client } from '@surtom/interfaces';
import { buildJoinWorldMessage, buildLeaveWorldMessage } from './joinWorldMessage';

describe('buildJoinWorldMessage', () => {
  it('builds a JOIN_WORLD client message with the given world id', () => {
    expect(buildJoinWorldMessage('fr')).toEqual({
      type: Client.MessageType.JOIN_WORLD,
      content: { worldId: 'fr' },
    });
  });

  it('uses any world id verbatim', () => {
    expect(buildJoinWorldMessage('en-extra')).toEqual({
      type: Client.MessageType.JOIN_WORLD,
      content: { worldId: 'en-extra' },
    });
  });
});

describe('buildLeaveWorldMessage', () => {
  it('builds a LEAVE_WORLD client message with no content (server uses its own worldId truth)', () => {
    expect(buildLeaveWorldMessage()).toEqual({ type: Client.MessageType.LEAVE_WORLD });
  });
});
