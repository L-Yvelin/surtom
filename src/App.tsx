import React, { useEffect } from "react";
import "./App.css";
import Header from "./components/Header/Header";
import Main from "./components/Main/Main";
import useKeyPress from "./hooks/keyboardEvents/useKeyPress";
import useTheme from "./hooks/useTheme";
import AchievementsStack from "./components/AchievementsStack/AchievementsStack";
import Tab from "./components/Tab/Tab";
import Stats from "./components/Stats/Stats";
import CustomWord from "./components/CustomWord/CustomWord";
import EndPage from "./components/EndPage/EndPage";
import Chat from "./components/Chat/Chat";
import useGameStore from "./stores/useGameStore";
import Loading from "./components/Loading/Loading";
import { useWebSocketStore } from "./stores/useWebSocketStore";
import WebSocketPingHandler from "./utils/webSocketPingHandler";

const App: React.FC = () => {
  const tabButtonRef = React.useRef<HTMLButtonElement>(null);
  const statsButtonRef = React.useRef<HTMLButtonElement>(null);
  const customWordButtonRef = React.useRef<HTMLButtonElement>(null);
  const endPageButtonRef = React.useRef<HTMLButtonElement>(null);
  const chatButtonRef = React.useRef<HTMLButtonElement>(null);

  const { theme, setTheme } = useTheme();
  const { hasLoaded, setHasLoaded } = useGameStore();
  const { connect } = useWebSocketStore();

  useKeyPress();

  useEffect(() => {
    console.log("hey");
    
    connect(); // Connect on mount

    setTimeout(() => {
      setHasLoaded(true);
    }, 1000);

    return () => {
      useWebSocketStore.getState().disconnect(); // Clean up on unmount
    };
  }, []);

  return (
    <div id="root-container">
      <Loading display={!hasLoaded} />

      <Header theme={theme} />
      <Main
        theme={theme}
        setTheme={setTheme}
        tabButtonRef={tabButtonRef}
        statsButtonRef={statsButtonRef}
        customWordButtonRef={customWordButtonRef}
        endPageButtonRef={endPageButtonRef}
        chatButtonRef={chatButtonRef}
      />

      {/* Floating interfaces */}
      <div className="windows">
        <Chat />
        <Stats statsButtonRef={statsButtonRef} />
        <AchievementsStack lifeTime={4} transitionDuration={0.5} />
        <CustomWord customWordButtonRef={customWordButtonRef} />
        <EndPage endPageButtonRef={endPageButtonRef} />
        <Tab tabButtonRef={tabButtonRef} />
      </div>

      <WebSocketPingHandler />
    </div>
  );
};

export default App;
