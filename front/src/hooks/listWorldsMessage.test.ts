import { Client } from '@surtom/interfaces';
import { buildListWorldsMessage } from './listWorldsMessage';

describe('buildListWorldsMessage', () => {
  it('builds a LIST_WORLDS client message with no payload', () => {
    expect(buildListWorldsMessage()).toEqual({
      type: Client.MessageType.LIST_WORLDS,
    });
  });
});
