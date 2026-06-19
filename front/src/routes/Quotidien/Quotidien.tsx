import React, { JSX } from 'react';
import { isDesktop } from 'react-device-detect';
import { useParams } from 'react-router-dom';
import Main from '../../features/Game/Game';
import { useGlobalKeyPress } from '../../features/Game/hooks/useKeyPress';
import AchievementsStack from '../../features/AchievementsStack/AchievementsStack';
import Tab from '../../features/Tab/Tab';
import Chat from '../../features/Chat/Chat';
import Cursors from '../../features/Cursors/Cursors';
import OwnCursorNameTag from '../../features/Cursors/OwnCursorNameTag/OwnCursorNameTag';
import WorldLoading from '../../ui/WorldLoading/WorldLoading';
import { useGameSession } from '../../hooks/useGameSession';
import { useJoinWorld } from '../../hooks/useJoinWorld';

function Quotidien(): JSX.Element {
  const tabButtonRef = React.useRef<HTMLButtonElement>(null);
  const menuButtonRef = React.useRef<HTMLButtonElement>(null);
  const chatButtonRef = React.useRef<HTMLButtonElement>(null);

  const { lang } = useParams<{ lang: string }>();
  const worldId = lang ?? 'fr';

  useGameSession(worldId);
  useJoinWorld(worldId);
  useGlobalKeyPress();

  return (
    <>
      <WorldLoading />
      <Main tabButtonRef={tabButtonRef} menuButtonRef={menuButtonRef} chatButtonRef={chatButtonRef} />

      <Cursors />

      <div className="windows">
        <Chat chatButtonRef={chatButtonRef} />
        <Tab tabButtonRef={tabButtonRef} />
      </div>

      <AchievementsStack lifeTime={4} transitionDuration={0.5} />

      {isDesktop && <OwnCursorNameTag />}
    </>
  );
}

export default Quotidien;
