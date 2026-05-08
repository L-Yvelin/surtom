import { Server } from '@surtom/interfaces';
import { useWorldsStore } from './useWorldsStore';

const sample: Server.WorldSummary[] = [{ id: 'fr', displayName: 'Français', language: 'fr', persistent: true, memberCount: 3 }];

beforeEach(() => {
  useWorldsStore.getState().reset();
});

describe('useWorldsStore', () => {
  it('starts in a clean state with no worlds and no fetch in flight', () => {
    const s = useWorldsStore.getState();
    expect(s.worlds).toBeNull();
    expect(s.isFetching).toBe(false);
    expect(s.error).toBeNull();
  });

  it('setFetching toggles the in-flight flag', () => {
    useWorldsStore.getState().setFetching(true);
    expect(useWorldsStore.getState().isFetching).toBe(true);
  });

  it('setWorlds populates the list and clears fetching/error', () => {
    useWorldsStore.getState().setFetching(true);
    useWorldsStore.getState().setError('previous error');
    useWorldsStore.getState().setWorlds(sample);
    const s = useWorldsStore.getState();
    expect(s.worlds).toEqual(sample);
    expect(s.isFetching).toBe(false);
    expect(s.error).toBeNull();
  });

  it('reset returns to the initial state', () => {
    useWorldsStore.getState().setWorlds(sample);
    useWorldsStore.getState().reset();
    const s = useWorldsStore.getState();
    expect(s.worlds).toBeNull();
    expect(s.isFetching).toBe(false);
  });
});
