import React, { useState } from "react";
import "./App.css";
import Header from "./components/Header/Header";
import Main from "./components/Main/Main";
import useKeyPress from "./hooks/keyboardEvents/useKeyPress";
import useTheme from "./hooks/useTheme";
import AchievementsStack from "./components/AchievementsStack/AchievementsStack";
import { AchievementProps } from "./components/AchievementsStack/Achievement/Achievement";
import Tab, { Player } from "./components/Tab/Tab";
import Stats from "./components/Stats/Stats";
import CustomWord from "./components/CustomWord/CustomWord";

const App: React.FC = () => {
  const [achievements, setAchievements] = useState<AchievementProps[]>([]);
  const tabButtonRef = React.useRef<HTMLButtonElement>(null);
  const statsButtonRef = React.useRef<HTMLButtonElement>(null);
  const customWordButtonRef = React.useRef<HTMLButtonElement>(null);

  const { theme, setTheme } = useTheme();

  const solution = "minecraft";
  const player: Player = {
    name: "UneSo6",
    xp: 1895,
    isModerator: 3,
    isMobile: true,
  };

  const players: Player[] = [
    {
      name: "PattateDouce",
      xp: 6969,
      isModerator: 2,
      isMobile: false,
    },
    {
      name: "hg",
      xp: 0,
      isModerator: 1,
      isMobile: false,
    },
  ];

  const addAchievement = (newAchievement: AchievementProps) => {
    setAchievements((prevAchievements) =>
      [...prevAchievements, newAchievement].slice(-5)
    );
  };

  const {
    letters,
    setLetters,
    tries,
    setTries,
    showTab,
    setShowTab,
    showStats,
    setShowStats,
    showCustomWord,
    setShowCustomWord,
  } = useKeyPress(addAchievement, solution);

  return (
    <div id="root-container">
      <Header theme={theme} />
      <Main
        solution={solution}
        tries={[...tries, letters]}
        player={player}
        players={players}
        theme={theme}
        setTheme={setTheme}
        setShowTab={setShowTab}
        tabButtonRef={tabButtonRef}
        setShowStats={setShowStats}
        statsButtonRef={statsButtonRef}
        setShowCustomWord={setShowCustomWord}
        customWordButtonRef={customWordButtonRef}
      />

      {/* Floating interfaces */}
      <div className="windows">
        <Stats
          scores={{ 1: 120, 2: 68, 3: 32, 4: 4, 5: 1, 6: 0 }}
          display={showStats}
          setShowStats={setShowStats}
          statsButtonRef={statsButtonRef}
        />
        <AchievementsStack
          achievements={achievements}
          setAchievements={setAchievements}
          lifeTime={3}
          transitionDuration={0.5}
        />
        <CustomWord
          display={showCustomWord}
          setShowCustomWord={setShowCustomWord}
          customWordButtonRef={customWordButtonRef}
          showAchievement={addAchievement}
        />
        <Tab
          playerList={players}
          display={showTab}
          setShowTab={setShowTab}
          tabButtonRef={tabButtonRef}
        />
      </div>
    </div>
  );
};

export default App;
