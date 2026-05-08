import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { KeyboardLayouts } from '../features/Game/Keyboard/utils';

interface SettingsState {
  keyboard: KeyboardLayouts | undefined;
  setKeyboard: (keyboard: KeyboardLayouts) => void;
  cycleKeyboard: () => void;
  sound: boolean;
  cycleSound: () => void;
  setSound: (sound: boolean) => void;
  reset: () => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      keyboard: undefined,
      sound: true,
      setKeyboard: (keyboard) => set({ keyboard }),
      cycleKeyboard: () =>
        set((state) => ({
          keyboard: state.keyboard === KeyboardLayouts.AZERTY ? KeyboardLayouts.QWERTY : KeyboardLayouts.AZERTY,
        })),
      setSound: (sound) => set({ sound }),
      cycleSound: () => set((state) => ({ sound: !state.sound })),
      reset: () => set({ keyboard: undefined, sound: true }),
    }),
    {
      name: 'settings',
    },
  ),
);
