import { JSX } from 'react';
import { FACE_DIRECTIONS, type Element3D } from './types';
import Face from './Face';
import classes from './Cuboid.module.css';

interface CuboidProps {
  element: Element3D;
  unit: number;
  textures: Record<string, string>;
}

function buildTransform(element: Element3D, unit: number): string {
  const cx = element.position.x * unit;
  const cy = -element.position.y * unit;
  const cz = element.position.z * unit;
  const placement = `translate3d(${cx}px, ${cy}px, ${cz}px)`;

  if (!element.rotation) return placement;

  const [ox, oy, oz] = element.rotation.origin;
  const px = ox * unit;
  const py = -oy * unit;
  const pz = oz * unit;

  const axis = element.rotation.axis;
  const sign = axis === 'y' ? 1 : -1;
  const angle = element.rotation.angle * sign;
  const fn = `rotate${axis.toUpperCase()}` as const;

  return [`translate3d(${px}px, ${py}px, ${pz}px)`, `${fn}(${angle}deg)`, `translate3d(${cx - px}px, ${cy - py}px, ${cz - pz}px)`].join(
    ' ',
  );
}

function Cuboid({ element, unit, textures }: CuboidProps): JSX.Element {
  const transform = buildTransform(element, unit);

  return (
    <div className={classes.cuboid} style={{ transform }} data-id={element.id}>
      {FACE_DIRECTIONS.map((dir) => {
        const face = element.faces[dir];
        if (!face) return null;
        return <Face key={dir} direction={dir} data={face} size={element.size} unit={unit} textures={textures} />;
      })}
    </div>
  );
}

export default Cuboid;
