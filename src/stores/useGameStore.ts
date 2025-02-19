import { AchievementProps } from "../components/AchievementsStack/Achievement/Achievement";
import { Message } from "../components/Chat/Chat";
import { Tries, Word } from "../components/Main/Game/Grid/types";
import { ScoreStats } from "../components/Stats/utils";
import { Player } from "../interfaces/Player";
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
  player: Player;
  setPlayer: (updatedPlayer: Partial<Player>) => void;
  playerList: Player[];
  setPlayerList: (players: Player[]) => void;
  addPlayer: (player: Player) => void;
  removePlayer: (playerName: string) => void;
  scores: ScoreStats;
  setScores: (scores: ScoreStats) => void;
  messages: Message[];
  setMessages: (messages: Message[]) => void;
  removeMessage: (messageId: string) => void;
  addMessage: (message: Message) => void;
  achievements: AchievementProps[];
  addAchievement: (achievement: AchievementProps) => void;
  removeAchievement: (achievementId: string) => void;
  hasLoaded: boolean;
  setHasLoaded: (hasLoaded: boolean) => void;
}

const defaultPlayer: Player = {
  name: "",
  isMobile: false,
  isModerator: 0,
  xp: 0,
};

const defaultMessage: Message = {
  id: "",
  player: defaultPlayer,
  content: {
    text: "En cours de chargement",
  },
  type: "message",
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
  messages: [defaultMessage],
  setMessages: (messages) => set({ messages }),
  removeMessage: (messageId) =>
    set((state) => ({
      messages: state.messages?.filter((m) => m.id !== messageId) || [],
    })),
  addMessage: (message) =>
    set((state) => ({ messages: [...(state.messages || []), message] })),
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
  hasLoaded: false,
  setHasLoaded: (hasLoaded) => set({ hasLoaded }),
}));

export default useGameStore;
