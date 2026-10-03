import { useChatStore } from '../../../stores/useChatStore';
import useUIStore from '../../../stores/useUIStore';
import { UI } from '../../../ui/ids';

export function startPrivateMessage(playerName: string): void {
  const ui = useUIStore.getState();
  ui.setVisibility(UI.TAB, false);
  ui.setVisibility(UI.CHAT, true);
  useChatStore.getState().focusInput(`/msg ${playerName} `);
}
