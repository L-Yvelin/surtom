import { JSX, useState } from 'react';
import classNames from 'classnames';
import Model3D from '../../../ui/Model3D/Model3D';
import type { MinecraftModelJson } from '../../../ui/Model3D/types';
import cobblestone from '../../../assets/images/blocks/cobblestone.png';
import leverTexture from '../../../assets/images/blocks/lever.png';
import classes from './Lever.module.css';

interface LeverProps {
  on?: boolean;
  onChange?: (on: boolean) => void;
  className?: string;
  ariaLabel?: string;
  buttonRef?: React.RefObject<HTMLButtonElement | null>;
}

const TEXTURES = { base: cobblestone, lever: leverTexture };

const BASE_ELEMENT = {
  name: 'base',
  from: [5, -0.02, 4] as [number, number, number],
  to: [11, 2.98, 12] as [number, number, number],
  faces: {
    down: { uv: [5, 4, 11, 12] as [number, number, number, number], texture: '#base', cullface: 'down' },
    up: { uv: [5, 4, 11, 12] as [number, number, number, number], texture: '#base' },
    north: { uv: [5, 0, 11, 3] as [number, number, number, number], texture: '#base' },
    south: { uv: [5, 0, 11, 3] as [number, number, number, number], texture: '#base' },
    west: { uv: [4, 0, 12, 3] as [number, number, number, number], texture: '#base' },
    east: { uv: [4, 0, 12, 3] as [number, number, number, number], texture: '#base' },
  },
};

const STICK_FACES = {
  up: { uv: [7, 6, 9, 8] as [number, number, number, number], texture: '#lever' },
  north: { uv: [7, 6, 9, 16] as [number, number, number, number], texture: '#lever' },
  south: { uv: [7, 6, 9, 16] as [number, number, number, number], texture: '#lever' },
  west: { uv: [7, 6, 9, 16] as [number, number, number, number], texture: '#lever' },
  east: { uv: [7, 6, 9, 16] as [number, number, number, number], texture: '#lever' },
};

const LEVER_ON: MinecraftModelJson = {
  elements: [
    BASE_ELEMENT,
    { name: 'stick', from: [7, 1, 7], to: [9, 11, 9], rotation: { origin: [8, 1, 8], axis: 'x', angle: -45 }, faces: STICK_FACES },
  ],
};

const LEVER_OFF: MinecraftModelJson = {
  elements: [
    BASE_ELEMENT,
    { name: 'stick', from: [7, 1, 7], to: [9, 11, 9], rotation: { origin: [8, 1, 8], axis: 'x', angle: 45 }, faces: STICK_FACES },
  ],
};

function Lever({ on, onChange, className, ariaLabel, buttonRef }: LeverProps): JSX.Element {
  const [internalOn, setInternalOn] = useState(false);
  const isOn = on ?? internalOn;

  const handleClick = () => {
    const next = !isOn;
    setInternalOn(next);
    onChange?.(next);
  };

  return (
    <button
      ref={buttonRef}
      type="button"
      className={classNames(classes.button, className)}
      onClick={handleClick}
      aria-label={ariaLabel}
      aria-pressed={isOn}
    >
      <Model3D model={isOn ? LEVER_ON : LEVER_OFF} textures={TEXTURES} modelCenter={[8, 1, 6.5]} unit={5} rotationX={-90} />
    </button>
  );
}

export default Lever;
