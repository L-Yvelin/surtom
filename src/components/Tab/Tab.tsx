import classNames from "classnames";
import classes from "./Tab.module.css";
import TabItem from "./TabItem/TabItem";
import { useRef } from "react";
import useClickOutside from "../../hooks/useClickOutside";
import { JSX } from "react";

interface TabProps {
  playerList: Player[];
  display: boolean;
  setShowTab: (value: (prev: boolean) => boolean) => void;
  tabButtonRef: React.RefObject<HTMLButtonElement | null>;
}

export interface Player {
  name: string;
  xp: number;
  isModerator: number;
  isMobile: boolean;
}

function Tab({
  playerList,
  display,
  setShowTab,
  tabButtonRef,
}: TabProps): JSX.Element {
  const tabRef = useRef<HTMLDivElement>(null);

  useClickOutside(tabRef, () => setShowTab(() => false), [tabButtonRef]);

  return (
    <div
      className={classNames(classes.tab, { [classes.hidden]: !display })}
      ref={tabRef}
    >
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
