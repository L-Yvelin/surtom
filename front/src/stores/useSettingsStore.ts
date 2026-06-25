import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { KeyboardLayouts } from '../features/Game/Keyboard/utils';

export type KeybindAction = 'openChat' | 'openCommand' | 'playerList';

export const KEYBIND_ACTIONS: KeybindAction[] = ['openChat', 'openCommand', 'playerList'];

export const DEFAULT_KEYBINDINGS: Record<KeybindAction, string> = {
  openChat: 't',
  openCommand: '/',
  playerList: 'Tab',
};

interface SettingsState {
  keyboard: KeyboardLayouts | undefined;
  setKeyboard: (keyboard: KeyboardLayouts) => void;
  cycleKeyboard: () => void;
  sound: boolean;
  cycleSound: () => void;
  setSound: (sound: boolean) => void;
  keybindings: Record<KeybindAction, string>;
  setKeybinding: (action: KeybindAction, key: string) => void;
  resetKeybindings: () => void;
  reset: () => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      keyboard: undefined,
      sound: true,
      keybindings: { ...DEFAULT_KEYBINDINGS },
      setKeyboard: (keyboard) => set({ keyboard }),
      cycleKeyboard: () =>
        set((state) => ({
          keyboard: state.keyboard === KeyboardLayouts.AZERTY ? KeyboardLayouts.QWERTY : KeyboardLayouts.AZERTY,
        })),
      setSound: (sound) => set({ sound }),
      cycleSound: () => set((state) => ({ sound: !state.sound })),
      setKeybinding: (action, key) =>
        set((state) => {
          const next = { ...DEFAULT_KEYBINDINGS, ...state.keybindings };
          const previous = next[action];
          const conflicting = KEYBIND_ACTIONS.find((a) => a !== action && next[a] === key);
          next[action] = key;
          if (conflicting) next[conflicting] = previous;
          return { keybindings: next };
        }),
      resetKeybindings: () => set({ keybindings: { ...DEFAULT_KEYBINDINGS } }),
      reset: () => set({ keyboard: undefined, sound: true, keybindings: { ...DEFAULT_KEYBINDINGS } }),
    }),
    {
      name: 'settings',
    },
  ),
);
