import { useEffect, useState } from 'react';
import { detectKeyboardLayout, KeyboardLayouts } from '../components/Main/Keyboard/utils';

const STORAGE_KEY = 'keyboard-layout';

const LAYOUTS: Record<KeyboardLayouts, Record<string, string>> = {
  [KeyboardLayouts.AZERTY]: { KeyQ: 'a', KeyW: 'z', KeyA: 'q', KeyZ: 'w' },
  [KeyboardLayouts.QWERTY]: { KeyQ: 'q', KeyW: 'w', KeyA: 'a', KeyZ: 'z' },
};

function score(samples: Record<string, string>): KeyboardLayouts {
  let best = KeyboardLayouts.QWERTY;
  let max = -1;
  for (const [layout, map] of Object.entries(LAYOUTS) as [KeyboardLayouts, Record<string, string>][]) {
    const s = Object.entries(samples).filter(([code, key]) => map[code] === key).length;
    if (s > max) {
      max = s;
      best = layout;
    }
  }
  return best;
}

const hasNavigatorKeyboard = 'keyboard' in navigator;

/**
 * Detects the keyboard layout using the navigator.keyboard API if available, otherwise uses keyboard events detection mapping (saved to localStorage).
 * @param fallback - The fallback keyboard layout to use if the navigator.keyboard API is not available.
 * @returns The detected keyboard layout.
 */
export default function useKeyboardLayout(fallback = KeyboardLayouts.QWERTY): KeyboardLayouts {
  const stored = hasNavigatorKeyboard ? null : (localStorage.getItem(STORAGE_KEY) as KeyboardLayouts | null);
  const [layout, setLayout] = useState<KeyboardLayouts>(stored ?? fallback);

  useEffect(() => {
    if (hasNavigatorKeyboard) {
      detectKeyboardLayout().then((detected) => {
        if (detected) setLayout(detected);
      });
      return;
    }

    const codes = new Set(Object.values(LAYOUTS).flatMap((m) => Object.keys(m)));
    const samples: Record<string, string> = {};

    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.altKey || e.metaKey || !codes.has(e.code)) return;
      samples[e.code] = e.key.toLowerCase();
      const detected = score(samples);
      localStorage.setItem(STORAGE_KEY, detected);
      setLayout(detected);
    };

    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  return layout;
}
