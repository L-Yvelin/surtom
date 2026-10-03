export interface AnimateLevelOptions {
  from: number;
  to: number;
  onUpdate: (level: number) => void;
  onLevelUp: () => void;
  onComplete?: () => void;
  schedule?: (cb: () => void) => void;
}

const STEP = 0.01;

export function animateLevel(opts: AnimateLevelOptions): () => void {
  const { from, to, onUpdate, onLevelUp, onComplete } = opts;
  const schedule = opts.schedule ?? ((cb: () => void) => requestAnimationFrame(cb));

  let cancelled = false;
  const cancel = () => {
    cancelled = true;
  };

  if (to <= from) {
    onUpdate(to);
    onComplete?.();
    return cancel;
  }

  let start = from;
  const tick = () => {
    if (cancelled) return;
    if (start + STEP < to) {
      start += STEP;
      onUpdate(start);
      if (Math.abs(start - Math.floor(start)) < STEP) {
        onLevelUp();
      }
      schedule(tick);
    } else {
      onUpdate(to);
      onComplete?.();
    }
  };
  schedule(tick);
  return cancel;
}
