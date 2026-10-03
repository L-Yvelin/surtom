export interface SoundPlayer {
  play: () => void;
}

export function createSoundPlayer(url: string): SoundPlayer {
  let template: HTMLAudioElement | null = null;
  if (typeof Audio !== 'undefined') {
    template = new Audio(url);
    template.preload = 'auto';
  }

  return {
    play() {
      if (!template) return;
      try {
        const voice = template.cloneNode(true) as HTMLAudioElement;
        void voice.play();
      } catch {
        /* noop */
      }
    },
  };
}
