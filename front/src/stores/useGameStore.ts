import { Server } from "../../../interfaces/Message";
import { AchievementProps } from "../components/AchievementsStack/Achievement/Achievement";
import { Tries, Word } from "../components/Main/Game/Grid/types";
import { ScoreStats } from "../components/Stats/utils";
import { create } from "zustand";

interface GameState {
  solution: string;
  setSolution: (solution: string) => void;
  tries: Tries;
  setTries: (tries: Tries) => void;
  addTry: (word: Word) => void;
  letters: Word;
  setLetters: (letters: Word) => void;
  gameFinished: boolean;
  setGameFinished: (gameFinished: boolean) => void;
  player: Server.User;
  setPlayer: (updatedPlayer: Partial<Server.User>) => void;
  playerList: Server.User[];
  setPlayerList: (players: Server.User[]) => void;
  addPlayer: (player: Server.User) => void;
  removePlayer: (playerName: string) => void;
  scores: ScoreStats;
  setScores: (scores: ScoreStats) => void;
  achievements: AchievementProps[];
  addAchievement: (achievement: AchievementProps) => void;
  removeAchievement: (achievementId: string) => void;
  hasLoaded: boolean;
  setHasLoaded: (hasLoaded: boolean) => void;
}

export const defaultPlayer: Server.User = {
  name: "",
  isMobile: false,
  isLoggedIn: true,
  moderatorLevel: 3,
  xp: 0,
};

const useGameStore = create<GameState>((set) => ({
  solution: "solution",
  setSolution: (solution) =>
    set(() => ({
      solution,
    })),
  tries: [],
  setTries: (tries) => set({ tries }),
  addTry: (word) => set((state) => ({ tries: [...(state.tries || []), word] })),
  letters: [],
  setLetters: (letters) => set({ letters }),
  gameFinished: false,
  setGameFinished: (gameFinished) => set({ gameFinished }),
  player: defaultPlayer,
  setPlayer: (updatedPlayer) =>
    set((state) => ({
      player: {
        ...defaultPlayer,
        ...state.player,
        ...updatedPlayer,
      },
    })),
  playerList: [],
  setPlayerList: (players) => set({ playerList: players }),
  addPlayer: (player) =>
    set((state) => ({ playerList: [...(state.playerList || []), player] })),
  removePlayer: (playerName) =>
    set((state) => ({
      playerList: state.playerList?.filter((p) => p.name !== playerName) || [],
    })),
  scores: {},
  setScores: (scores) => set({ scores }),
  achievements: [],
  addAchievement: (achievement) =>
    set((state) => ({
      achievements: [...(state.achievements || []), achievement].slice(-5),
    })),
  removeAchievement: (achievementId) =>
    set((state) => ({
      achievements:
        state.achievements?.filter((a) => a.id !== achievementId) || [],
    })),
  hasLoaded: true,
  setHasLoaded: (hasLoaded) => set({ hasLoaded }),
}));

export default useGameStore;
