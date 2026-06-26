import { type ElementFace, type FaceName, type ModelElement } from '../../mc/blockModels';
import { defaultUv, faceBackground, faceLayout } from './geometry';
import classes from './BlockModel.module.css';

interface FaceProps {
  face: FaceName;
  data: ElementFace;
  el: ModelElement;
  width: number;
  height: number;
  depth: number;
  url: string;
  tint: string;
}

export function Face({ face, data, el, width, height, depth, url, tint }: FaceProps): React.ReactElement {
  const layout = faceLayout(face, width, height, depth);
  const uv = data.uv ?? defaultUv(face, el);
  const bg = faceBackground(uv, layout.width, layout.height);
  const rotate = data.rotation ? `rotate(${data.rotation}deg)` : undefined;
  const brightness = `brightness(${face === 'down' ? 0.6 : 1})`;

  return (
    <div className={classes.face} style={{ width: layout.width, height: layout.height, transform: layout.transform }}>
      <div
        className={classes.texture}
        style={{
          backgroundImage: `url("${url}")`,
          backgroundSize: bg.size,
          backgroundPosition: bg.position,
          transform: rotate,
          filter: brightness,
        }}
      />
      {data.tintindex !== undefined && (
        <div
          className={classes.tint}
          style={{
            backgroundColor: tint,
            maskImage: `url("${url}")`,
            WebkitMaskImage: `url("${url}")`,
            maskSize: bg.size,
            WebkitMaskSize: bg.size,
            maskPosition: bg.position,
            WebkitMaskPosition: bg.position,
            transform: rotate,
            filter: brightness,
          }}
        />
      )}
      {face === 'down' && <div className={classes.shade} />}
    </div>
  );
}
