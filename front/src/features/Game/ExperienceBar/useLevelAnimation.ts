import { useEffect, useRef } from 'react';
import levelUpSound from '../../../assets/sounds/level_up.mp3';
import { animateLevel } from './animateLevel';
import { useSettingsStore } from '../../../stores/useSettingsStore';
import { createSoundPlayer } from '../../../utils/sound';

const levelUp = createSoundPlayer(levelUpSound);

export function useLevelAnimation(level: number, setRealtimeLevel: React.Dispatch<React.SetStateAction<number>>, hasLoaded: boolean): void {
  const previousLevelRef = useRef(level);
  const sound = useSettingsStore((s) => s.sound);

  useEffect(() => {
    if (!hasLoaded) {
      previousLevelRef.current = level;
      setRealtimeLevel(level);
      return;
    }

    const from = previousLevelRef.current;
    const cancel = animateLevel({
      from,
      to: level,
      onUpdate: setRealtimeLevel,
      onLevelUp: sound ? levelUp.play : () => {},
      onComplete: () => {
        previousLevelRef.current = level;
      },
    });

    return cancel;
  }, [level, setRealtimeLevel, hasLoaded, sound]);
}
