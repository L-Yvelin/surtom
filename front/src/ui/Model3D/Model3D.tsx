import { JSX, useMemo } from 'react';
import classNames from 'classnames';
import Cuboid from './Cuboid';
import { parseMinecraftModel } from './parser';
import type { MinecraftModelJson } from './types';
import classes from './Model3D.module.css';

interface Model3DProps {
  model: MinecraftModelJson;
  textures: Record<string, string>;
  unit?: number;
  /**
   * The MC-space coordinate placed at the visual center of the parent.
   * Defaults to the center of a 16x16x16 block.
   */
  modelCenter?: [number, number, number];
  rotationX?: number;
  rotationY?: number;
  className?: string;
  style?: React.CSSProperties;
}

function Model3D({
  model,
  textures,
  unit = 16,
  modelCenter = [8, 8, 8],
  rotationX = 0,
  rotationY = 0,
  className,
  style,
}: Model3DProps): JSX.Element {
  const scene = useMemo(() => parseMinecraftModel(model), [model]);

  const [cx, cy, cz] = modelCenter;
  const parts: string[] = [];
  if (rotationX !== 0) parts.push(`rotateX(${rotationX}deg)`);
  if (rotationY !== 0) parts.push(`rotateY(${rotationY}deg)`);
  parts.push(`translate3d(${-cx * unit}px, ${cy * unit}px, ${-cz * unit}px)`);
  const transform = parts.join(' ');

  return (
    <div className={classNames(classes.model, className)} style={{ transform, ...style }}>
      {scene.elements.map((element) => (
        <Cuboid key={element.id} element={element} unit={unit} textures={textures} />
      ))}
    </div>
  );
}

export default Model3D;
