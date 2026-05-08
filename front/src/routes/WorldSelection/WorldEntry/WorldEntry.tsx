import { JSX } from 'react';
import classNames from 'classnames';
import classes from './WorldEntry.module.css';
import { useTranslation } from 'react-i18next';

export interface World {
  id: string;
  name: string;
  persistent: boolean;
  description: string;
}

interface WorldEntryProps extends React.HTMLAttributes<HTMLButtonElement> {
  world: World;
  selected: boolean;
  onSelect: () => void;
}

function WorldEntry({ world, selected, onSelect, ...rest }: WorldEntryProps): JSX.Element {
  const { t } = useTranslation();

  const thumbnail = world.persistent ? (world.name === 'Français' ? 'fr' : world.name === 'English' ? 'en' : 'custom') : 'custom';

  return (
    <button {...rest} className={classNames(classes.entry, { [classes.selected]: selected })} onClick={onSelect} type="button">
      <div className={classNames(classes.thumbnail, classes[`thumbnail_${thumbnail}`])} aria-hidden />
      <div className={classes.body}>
        <div className={classes.name}>{world.name}</div>
        <div className={classes.subtitle}>{world.persistent ? t('worldSelection.modeDaily') : t('worldSelection.modeTemp')}</div>
        <div className={classes.description}>{world.description}</div>
      </div>
    </button>
  );
}

export default WorldEntry;
