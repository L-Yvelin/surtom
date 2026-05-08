import { Client } from '@surtom/interfaces';
import { buildJoinWorldMessage } from './joinWorldMessage';

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
