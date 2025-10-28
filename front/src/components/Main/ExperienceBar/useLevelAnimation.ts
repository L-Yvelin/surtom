import { useEffect, useRef } from "react";
import levelUpSound from "../../../assets/sounds/level_up.mp3";

export function useLevelAnimation(
  level: number,
  setRealtimeLevel: React.Dispatch<React.SetStateAction<number>>,
): void {
  const previousLevelRef = useRef(level);

  useEffect(() => {
    if (level > previousLevelRef.current) {
      let start = previousLevelRef.current;
      const target = level;
      const step = 0.01;

      const animate = () => {
        if (start + step < target) {
          start += step;
          setRealtimeLevel(start);

          if (Math.abs(start - Math.floor(start)) < 0.01) {
            try {
              new Audio(levelUpSound).play();
            } catch {}
          }

          requestAnimationFrame(animate);
        } else {
          previousLevelRef.current = target;
        }
      };

      requestAnimationFrame(animate);
    } else {
      setRealtimeLevel(level);
      previousLevelRef.current = level;
    }
  }, [level, setRealtimeLevel]);
}
