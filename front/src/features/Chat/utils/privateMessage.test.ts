import { useChatStore } from '../../../stores/useChatStore';
import useUIStore from '../../../stores/useUIStore';
import { UI } from '../../../ui/ids';
import { startPrivateMessage } from './privateMessage';

beforeEach(() => {
  useUIStore.setState({ visibility: {} });
  useChatStore.setState({ focusInput: jest.fn() });
});

describe('startPrivateMessage', () => {
  test('opens the chat and prefills the input with a /msg command for the player', () => {
    const focusInput = jest.fn();
    useChatStore.setState({ focusInput });
    startPrivateMessage('Alice');
    expect(useUIStore.getState().visibility[UI.CHAT]).toBe(true);
    expect(focusInput).toHaveBeenCalledWith('/msg Alice ');
  });

  test('closes the player list', () => {
    useUIStore.setState({ visibility: { [UI.TAB]: true } });
    startPrivateMessage('Alice');
    expect(useUIStore.getState().visibility[UI.TAB]).toBe(false);
  });
});
