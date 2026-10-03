import { BlockBar, type BlockBarMaterial } from '@surtom/design-system';

type ScoreBarProps = {
  display: boolean;
  index: number;
  value: number;
  total: number;
  increaseFactor: number;
};

const MATERIAL_BY_INDEX: Record<number, BlockBarMaterial> = {
  1: 'diamond',
  2: 'gold',
  3: 'stone',
  4: 'sand',
  5: 'gravel',
};

function ScoreBar({ display, index, value, total, increaseFactor }: ScoreBarProps) {
  const percentage = total > 0 ? (value / total) * (100 + increaseFactor) : 0;
  return (
    <BlockBar material={MATERIAL_BY_INDEX[index] ?? 'dirt'} heightPercent={percentage} revealed={display} label={index} badge={value} />
  );
}

export default ScoreBar;
