import { useEffect, useMemo, useState } from 'react';
import { loadTextureUrl, resolveModel, resolveTextureRef, type ResolvedModel } from '../../mc/blockModels';
import { useResourcePackStore } from '../../stores/useResourcePackStore';
import { FACES, collectTexturePaths, elementGeometry } from './geometry';
import { Face } from './Face';
import classes from './BlockModel.module.css';

interface BlockModelProps {
  model: string;
  size?: number;
  pitch?: number;
  yaw?: number;
  tint?: string;
  className?: string;
}

export function BlockModel({ model, size = 64, pitch = -30, yaw = 45, tint = '#79c05a', className }: BlockModelProps): React.ReactElement {
  const overrides = useResourcePackStore((s) => s.overrides);
  const modelOverrides = useResourcePackStore((s) => s.modelOverrides);
  const [resolved, setResolved] = useState<ResolvedModel | null>(null);
  const [urls, setUrls] = useState<Record<string, string>>({});

  useEffect(() => {
    const data = resolveModel(model, modelOverrides);
    setResolved(data);
    const paths = collectTexturePaths(data.elements, data.textures);
    const map: Record<string, string> = {};
    for (const path of paths) {
      const override = overrides[`${path.replace(/^minecraft:/, '')}.png`];
      const url = override ?? loadTextureUrl(path);
      if (url) map[path] = url;
    }
    setUrls(map);
  }, [model, overrides, modelOverrides]);

  const elements = useMemo(() => (resolved ? resolved.elements.map((el) => elementGeometry(el, size / 16)) : []), [resolved, size]);

  return (
    <div className={`${classes.scene} ${className ?? ''}`} style={{ width: size, height: size }}>
      <div className={classes.model} style={{ transform: `rotateX(${pitch}deg) rotateY(${yaw}deg)` }}>
        {resolved &&
          elements.map(({ el, width, height, depth, transform }, index) => (
            <div key={index} className={classes.cuboid} style={{ transform }}>
              {FACES.map((face) => {
                const data = el.faces[face];
                const path = data && resolveTextureRef(resolved.textures, data.texture);
                const url = path ? urls[path] : undefined;
                if (!data || !url) return null;
                return (
                  <Face key={face} face={face} data={data} el={el} width={width} height={height} depth={depth} url={url} tint={tint} />
                );
              })}
            </div>
          ))}
      </div>
    </div>
  );
}
