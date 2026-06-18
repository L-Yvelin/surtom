import { JSX } from 'react';
import classNames from 'classnames';
import Model3D from '../../../ui/Model3D/Model3D';
import type { MinecraftModelJson } from '../../../ui/Model3D/types';
import lampOff from '../../../assets/images/blocks/redstone_lamp.png';
import lampOn from '../../../assets/images/blocks/redstone_lamp_on.png';
import cobblestone from '../../../assets/images/blocks/cobblestone.png';
import leverTexture from '../../../assets/images/blocks/lever.png';
import classes from './LampLever.module.css';

interface LampLeverProps {
  on: boolean;
  onChange: (on: boolean) => void;
  className?: string;
  ariaLabel?: string;
}

const CUBE_FACES = (tex: string) => ({
  down: { uv: [0, 0, 16, 16] as [number, number, number, number], texture: tex, cullface: 'down' },
  up: { uv: [0, 0, 16, 16] as [number, number, number, number], texture: tex, cullface: 'up' },
  north: { uv: [0, 0, 16, 16] as [number, number, number, number], texture: tex, cullface: 'north' },
  south: { uv: [0, 0, 16, 16] as [number, number, number, number], texture: tex, cullface: 'south' },
  west: { uv: [0, 0, 16, 16] as [number, number, number, number], texture: tex, cullface: 'west' },
  east: { uv: [0, 0, 16, 16] as [number, number, number, number], texture: tex, cullface: 'east' },
});

const LEVER_BASE_FACES = {
  down: { uv: [5, 4, 11, 12] as [number, number, number, number], texture: '#base', cullface: 'down' },
  up: { uv: [5, 4, 11, 12] as [number, number, number, number], texture: '#base' },
  north: { uv: [5, 0, 11, 3] as [number, number, number, number], texture: '#base' },
  south: { uv: [5, 0, 11, 3] as [number, number, number, number], texture: '#base' },
  west: { uv: [4, 0, 12, 3] as [number, number, number, number], texture: '#base' },
  east: { uv: [4, 0, 12, 3] as [number, number, number, number], texture: '#base' },
};

const STICK_FACES = {
  up: { uv: [7, 6, 9, 8] as [number, number, number, number], texture: '#lever' },
  north: { uv: [7, 6, 9, 16] as [number, number, number, number], texture: '#lever' },
  south: { uv: [7, 6, 9, 16] as [number, number, number, number], texture: '#lever' },
  west: { uv: [7, 6, 9, 16] as [number, number, number, number], texture: '#lever' },
  east: { uv: [7, 6, 9, 16] as [number, number, number, number], texture: '#lever' },
};

function buildModel(isOn: boolean): MinecraftModelJson {
  return {
    elements: [
      {
        name: 'lamp',
        from: [0, 0, 0],
        to: [16, 16, 16],
        faces: CUBE_FACES('#lamp'),
      },
      {
        name: 'lever-base',
        from: [5, 15.98, 4],
        to: [11, 18.98, 12],
        faces: LEVER_BASE_FACES,
      },
      {
        name: 'stick',
        from: [7, 17, 7],
        to: [9, 27, 9],
        rotation: { origin: [8, 17, 8], axis: 'x', angle: isOn ? -45 : 45 },
        faces: STICK_FACES,
      },
    ],
  };
}

const MODEL_ON = buildModel(true);
const MODEL_OFF = buildModel(false);

function LampLever({ on, onChange, className, ariaLabel }: LampLeverProps): JSX.Element {
  const textures = {
    lamp: on ? lampOn : lampOff,
    base: cobblestone,
    lever: leverTexture,
  };

  return (
    <button
      type="button"
      className={classNames(classes.button, className)}
      onClick={() => onChange(!on)}
      aria-label={ariaLabel}
      aria-pressed={on}
    >
      <Model3D model={on ? MODEL_ON : MODEL_OFF} textures={textures} modelCenter={[8, 8, 8]} unit={4} rotationX={-90} />
    </button>
  );
}

export default LampLever;
