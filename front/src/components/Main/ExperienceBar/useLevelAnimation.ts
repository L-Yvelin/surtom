import { useEffect, useRef } from 'react';
import levelUpSound from '../../../assets/sounds/level_up.mp3';

let levelUpAudio: HTMLAudioElement | null = null;

const playLevelUp = () => {
  try {
    if (!levelUpAudio) {
      levelUpAudio = new Audio(levelUpSound);
    }
    levelUpAudio.currentTime = 0;
    void levelUpAudio.play();
  } catch {
    /* noop */
  }
};

export function useLevelAnimation(level: number, setRealtimeLevel: React.Dispatch<React.SetStateAction<number>>, hasLoaded: boolean): void {
  const previousLevelRef = useRef(level);

  useEffect(() => {
    if (!hasLoaded) {
      previousLevelRef.current = level;
      setRealtimeLevel(level);
      return;
    }

    if (level > previousLevelRef.current) {
      let start = previousLevelRef.current;
      const target = level;
      const step = 0.01;

      const animate = () => {
        if (start + step < target) {
          start += step;
          setRealtimeLevel(start);

          if (Math.abs(start - Math.floor(start)) < 0.01) {
            playLevelUp();
          }

          requestAnimationFrame(animate);
        } else {
          previousLevelRef.current = target;
          setRealtimeLevel(target);
        }
      };

      requestAnimationFrame(animate);
    } else {
      setRealtimeLevel(level);
      previousLevelRef.current = level;
    }
  }, [level, setRealtimeLevel]);
}
