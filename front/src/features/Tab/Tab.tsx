import classNames from 'classnames';
import classes from './Tab.module.css';
import TabItem from './TabItem/TabItem';
import { JSX } from 'react';
import useGameStore from '../../stores/useGameStore';
import useToast from '../../hooks/useToast';

interface TabProps {
  tabButtonRef: React.RefObject<HTMLButtonElement | null>;
}

function Tab({ tabButtonRef }: TabProps): JSX.Element {
  const playerList = useGameStore((s) => s.playerList);
  const { toastRef, visible } = useToast('tab', tabButtonRef);

  return (
    <div className={classNames(classes.tab, { [classes.hidden]: !visible })} ref={toastRef}>
      {playerList.map((user) => (
        <div key={user.name}>
          <TabItem user={user} />
        </div>
      ))}
      {playerList.length < 20 &&
        [...Array(20 - playerList.length)].map((_, index) => (
          <div key={`fill-${index}`}>
            <TabItem />
          </div>
        ))}
    </div>
  );
}

export default Tab;
