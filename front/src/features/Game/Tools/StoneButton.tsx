import { JSX, useState } from 'react';
import classNames from 'classnames';
import Model3D from '../../../ui/Model3D/Model3D';
import type { MinecraftModelJson } from '../../../ui/Model3D/types';
import stoneTexture from '../../../assets/images/blocks/stone.png';
import classes from './StoneButton.module.css';

interface StoneButtonProps {
  onClick?: () => void;
  className?: string;
  ariaLabel?: string;
  buttonRef?: React.RefObject<HTMLButtonElement | null>;
}

const STONE_BUTTON_IDLE: MinecraftModelJson = {
  textures: { particle: '#texture' },
  elements: [
    {
      from: [5, 0, 6],
      to: [11, 2, 10],
      faces: {
        down: { uv: [5, 6, 11, 10], texture: '#texture', cullface: 'down' },
        up: { uv: [5, 6, 11, 10], texture: '#texture' },
        north: { uv: [5, 14, 11, 16], texture: '#texture' },
        south: { uv: [5, 14, 11, 16], texture: '#texture' },
        west: { uv: [6, 14, 10, 16], texture: '#texture' },
        east: { uv: [6, 14, 10, 16], texture: '#texture' },
      },
    },
  ],
};

const STONE_BUTTON_PRESSED: MinecraftModelJson = {
  textures: { particle: '#texture' },
  elements: [
    {
      from: [5, 0, 6],
      to: [11, 1, 10],
      faces: {
        down: { uv: [5, 6, 11, 10], texture: '#texture', cullface: 'down' },
        up: { uv: [5, 6, 11, 10], texture: '#texture' },
        north: { uv: [5, 15, 11, 16], texture: '#texture' },
        south: { uv: [5, 15, 11, 16], texture: '#texture' },
        west: { uv: [6, 15, 10, 16], texture: '#texture' },
        east: { uv: [6, 15, 10, 16], texture: '#texture' },
      },
    },
  ],
};

const STONE_TEXTURES = { texture: stoneTexture };

function StoneButton({ onClick, className, ariaLabel, buttonRef }: StoneButtonProps): JSX.Element {
  const [pressed, setPressed] = useState(false);

  const release = () => setPressed(false);

  return (
    <button
      ref={buttonRef}
      type="button"
      className={classNames(classes.button, className)}
      onPointerDown={() => setPressed(true)}
      onPointerUp={release}
      onPointerCancel={release}
      onPointerLeave={release}
      onClick={onClick}
      aria-label={ariaLabel}
    >
      <Model3D
        model={pressed ? STONE_BUTTON_PRESSED : STONE_BUTTON_IDLE}
        textures={STONE_TEXTURES}
        modelCenter={[8, 1, 8]}
        unit={9}
        rotationX={-90}
      />
    </button>
  );
}

export default StoneButton;
