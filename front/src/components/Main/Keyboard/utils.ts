import classes from './Keyboard.module.css';

export enum KeyboardLayouts {
  AZERTY = 'AZERTY',
  QWERTY = 'QWERTY',
}

const azerty = [
  ['a', 'z', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
  ['q', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'm'],
  ['w', 'x', 'c', 'v', 'b', 'n', '↲', '⌫'],
];

const qwerty = [
  ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
  ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', '↲'],
  ['z', 'x', 'c', 'v', 'b', 'n', 'm', '⌫'],
];

export function getKeyboardLayout(layout: KeyboardLayouts) {
  switch (layout) {
    case KeyboardLayouts.AZERTY:
      return azerty;
    case KeyboardLayouts.QWERTY:
      return qwerty;
    default:
      return qwerty;
  }
}

export function getKeyClassName(key: string): string {
  switch (key) {
    case '↲':
      return classes.enterKey;
    case '⌫':
      return classes.returnKey;
    default:
      return '';
  }
}

export function getButtonKeyEvent(key: string): string {
  const keyEvents: { [key: string]: string } = {
    '↲': 'Enter',
    '⌫': 'Backspace',
  };
  return keyEvents[key] || key;
}

export function getKeyboardClass(layout: KeyboardLayouts) {
  switch (layout) {
    case KeyboardLayouts.AZERTY:
      return classes.azerty;
    case KeyboardLayouts.QWERTY:
      return classes.qwerty;
    default:
      return classes.qwerty;
  }
}

export function getKeyStyle(key: string): React.CSSProperties {
  if (key === '↲') return { gridArea: 'E' };
  if (key === '⌫') return { gridArea: 'R' };
  return { gridArea: key };
}

export async function detectKeyboardLayout(): Promise<KeyboardLayouts | undefined> {
  const keyboard = (navigator as any).keyboard;
  const keyboardLayout = await keyboard.getLayoutMap().then((k: any) => {
    return (k.get('KeyQ') + k.get('KeyW') + k.get('KeyE') + k.get('KeyR') + k.get('KeyT') + k.get('KeyY')).toUpperCase();
  });

  switch (keyboardLayout) {
    case 'QWERTY':
      return KeyboardLayouts.QWERTY;
    case 'AZERTY':
      return KeyboardLayouts.AZERTY;
    default:
      return KeyboardLayouts.QWERTY;
  }
}
