import classNames from 'classnames';
import classes from './Tab.module.css';
import TabItem from './TabItem/TabItem';
import { JSX } from 'react';
import { useGameStore } from '../../stores/useGameStore';
import useScreen from '../../hooks/useScreen';

interface TabProps extends React.HTMLAttributes<HTMLDivElement> {
  tabButtonRef: React.RefObject<HTMLButtonElement | null>;
}

function Tab({ tabButtonRef, className, ...rest }: TabProps): JSX.Element {
  const playerList = useGameStore((s) => s.playerList);
  const { screenRef, visible } = useScreen('tab', tabButtonRef);

  return (
    <div {...rest} className={classNames(classes.tab, className, { [classes.hidden]: !visible })} ref={screenRef}>
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
