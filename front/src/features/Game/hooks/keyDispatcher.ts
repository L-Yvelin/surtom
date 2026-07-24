import type { InputScope } from '../../../stores/useInputStore';

export interface KeyDispatchDeps {
  showChat: boolean;
  focusInput: (message?: string) => void;
  gameFinished: boolean;
  shortcutsKeyDown: (event: KeyboardEvent) => void;
  shortcutsKeyUp: (event: KeyboardEvent) => void;
  gameKeyDown: (event: KeyboardEvent) => void;
}

export const isGameKey = (event: KeyboardEvent): boolean => ['Enter', 'Backspace'].includes(event.key) || /^[a-zA-Z]$/.test(event.key);

export function dispatchKey(event: KeyboardEvent, state: 'up' | 'down', topScope: InputScope | null, deps: KeyDispatchDeps): void {
  if (topScope?.policy === 'block-all') return;
  const isDeleteWord = (event.ctrlKey || event.altKey || event.metaKey) && event.key === 'Backspace';
  if (!isDeleteWord && (event.ctrlKey || event.metaKey || event.altKey)) return;

  const modalOpen = topScope?.policy === 'modal';

  if (state === 'down') {
    if (deps.showChat && isGameKey(event)) {
      deps.focusInput();
    } else if (!isGameKey(event) || deps.gameFinished) {
      deps.shortcutsKeyDown(event);
    } else if (!modalOpen && !deps.gameFinished) {
      deps.gameKeyDown(event);
    }
  } else {
    deps.shortcutsKeyUp(event);
  }
}
