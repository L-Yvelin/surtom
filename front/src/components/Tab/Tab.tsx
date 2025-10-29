import classNames from 'classnames';
import classes from './Tab.module.css';
import TabItem from './TabItem/TabItem';
import { useRef } from 'react';
import useClickOutside from '../../hooks/useClickOutside';
import { JSX } from 'react';
import useGameStore from '../../stores/useGameStore';
import useUIStore from '../../stores/useUIStore';

interface TabProps {
  tabButtonRef: React.RefObject<HTMLButtonElement | null>;
}

function Tab({ tabButtonRef }: TabProps): JSX.Element {
  const { playerList } = useGameStore();
  const { setVisibility, showTab: display } = useUIStore();

  const tabRef = useRef<HTMLDivElement>(null);

  useClickOutside(tabRef, () => setVisibility('showTab', false), [tabButtonRef]);

  return (
    <div className={classNames(classes.tab, { [classes.hidden]: !display })} ref={tabRef}>
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
