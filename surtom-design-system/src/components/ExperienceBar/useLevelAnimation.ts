import { useEffect, useRef } from 'react';
import levelUpSound from '../../assets/sounds/level_up.mp3';
import { animateLevel } from './animateLevel';
import { useDesignSystem } from '../../context/DesignSystemContext';
import { createSoundPlayer } from '../../utils/sound';

const levelUp = createSoundPlayer(levelUpSound);

export function useLevelAnimation(level: number, setRealtimeLevel: React.Dispatch<React.SetStateAction<number>>, animate: boolean): void {
  const previousLevelRef = useRef(level);
  const { soundEnabled } = useDesignSystem();

  useEffect(() => {
    if (!animate) {
      previousLevelRef.current = level;
      setRealtimeLevel(level);
      return;
    }

    const from = previousLevelRef.current;
    const cancel = animateLevel({
      from,
      to: level,
      onUpdate: setRealtimeLevel,
      onLevelUp: soundEnabled ? levelUp.play : () => {},
      onComplete: () => {
        previousLevelRef.current = level;
      },
    });

    return cancel;
  }, [level, setRealtimeLevel, animate, soundEnabled]);
}
