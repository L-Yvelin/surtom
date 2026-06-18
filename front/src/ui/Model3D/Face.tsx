import { JSX } from 'react';
import { calculateBackgroundPosition } from './uv';
import { faceSize, faceTransform, type CuboidSize } from './faceTransforms';
import type { FaceData, FaceDirection } from './types';
import classes from './Face.module.css';

interface FaceProps {
  direction: FaceDirection;
  data: FaceData;
  size: CuboidSize;
  unit: number;
  textures: Record<string, string>;
}

function resolveTextureUrl(textureKey: string, textures: Record<string, string>): string {
  const stripped = textureKey.startsWith('#') ? textureKey.slice(1) : textureKey;
  let resolved: string | undefined = textures[stripped];
  let depth = 0;
  while (resolved && resolved.startsWith('#') && depth++ < 8) {
    resolved = textures[resolved.slice(1)];
  }
  return resolved ?? '';
}

function Face({ direction, data, size, unit, textures }: FaceProps): JSX.Element {
  const dimensions = faceSize(direction, size, unit);
  const baseTransform = faceTransform(direction, size, unit);
  const url = resolveTextureUrl(data.texture, textures);
  const { backgroundSize, backgroundPosition } = calculateBackgroundPosition(data.uv, dimensions.width, dimensions.height);

  const textureRotation = data.rotation ? ` rotateZ(${data.rotation}deg)` : '';
  const transform = `translate(-50%, -50%) ${baseTransform}${textureRotation}`;

  return (
    <div
      className={classes.face}
      data-direction={direction}
      style={{
        width: `${Math.abs(dimensions.width)}px`,
        height: `${Math.abs(dimensions.height)}px`,
        transform,
        backgroundImage: url ? `url(${url})` : undefined,
        backgroundSize,
        backgroundPosition,
      }}
    />
  );
}

export default Face;
