import { useEffect, useRef, useState } from 'react';
import { BlockModel } from './BlockModel';
import classes from './RowBlockModel.module.css';

interface RowBlockModelProps {
  model: string;
  size?: number;
  count?: number;
  pitch?: number;
  yaw?: number;
  className?: string;
}

export function RowBlockModel({ model, size, count, pitch = 25, yaw = 0, className }: RowBlockModelProps): React.ReactElement {
  const ref = useRef<HTMLDivElement>(null);
  const [layout, setLayout] = useState<{ size: number; count: number }>({ size: size ?? 0, count: count ?? 0 });

  useEffect(() => {
    if (size != null && count != null) {
      setLayout({ size, count });
      return;
    }
    const element = ref.current;
    if (!element) return;
    const update = (): void => {
      const blockSize = size ?? element.clientHeight;
      const blocks = count ?? (blockSize > 0 ? Math.ceil(element.clientWidth / blockSize) : 0);
      setLayout({ size: blockSize, count: blocks });
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(element);
    return () => observer.disconnect();
  }, [size, count]);

  return (
    <div ref={ref} className={`${classes.row} ${className ?? ''}`}>
      {Array.from({ length: layout.count }, (_, index) => (
        <BlockModel key={index} model={model} size={layout.size} pitch={pitch} yaw={yaw} />
      ))}
    </div>
  );
}
