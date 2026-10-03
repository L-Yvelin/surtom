import classNames from 'classnames';
import classes from './Tab.module.css';
import TabItem from './TabItem/TabItem';
import { JSX } from 'react';
import { PlayerList, PLAYER_LIST_MAX_ROWS } from '@surtom/design-system';
import { useGameStore } from '../../stores/useGameStore';
import useScreen from '../../hooks/useScreen';

interface TabProps extends React.HTMLAttributes<HTMLDivElement> {
  tabButtonRef: React.RefObject<HTMLButtonElement | null>;
}

function Tab({ tabButtonRef, className, ...rest }: TabProps): JSX.Element {
  const playerList = useGameStore((s) => s.playerList);
  const { screenRef, visible } = useScreen('tab', tabButtonRef);

  return (
    <PlayerList
      {...rest}
      minRows={PLAYER_LIST_MAX_ROWS}
      className={classNames(classes.tab, className, { [classes.hidden]: !visible })}
      ref={screenRef}
    >
      {playerList.map((user, index) => (
        <TabItem key={`${user.name}-${index}`} user={user} />
      ))}
    </PlayerList>
  );
}

export default Tab;
