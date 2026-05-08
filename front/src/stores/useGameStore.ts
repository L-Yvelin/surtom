import { AchievementProps } from '../features/AchievementsStack/Achievement/Achievement';
import { Tries, Server, Word } from '@surtom/interfaces';
import { ScoreStats } from '../features/Stats/utils/scoreCalculation';
import { create } from 'zustand';
import { isGameFinished } from '../features/Game/utils/gameLogic';

interface GameState {
  solution: string | undefined;
  setSolution: (solution: string) => void;
  validWords: string[];
  setValidWords: (validWords: string[]) => void;
  tries: Tries;
  setTries: (tries: Tries) => void;
  addTry: (word: Word) => void;
  letters: Word;
  gameFinished: () => boolean;
  showProgression: boolean;
  setShowProgression: (showProgression: boolean) => void;
  setLetters: (letters: Word) => void;
  player: Server.User;
  setPlayer: (updatedPlayer: Partial<Server.User>) => void;
  setXP: (xp: number) => void;
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
  wasFinishedOnLoad: boolean;
  setWasFinishedOnLoad: (wasFinishedOnLoad: boolean) => void;
  resetSession: () => void;
  resetWorld: () => void;
}

export const defaultPlayer: Server.User = {
  name: '',
  isMobile: false,
  isLoggedIn: false,
  moderatorLevel: 0,
  xp: 0,
};

const initialSession = {
  achievements: [] as AchievementProps[],
  letters: [] as Word,
};

const initialWorld = {
  solution: undefined as string | undefined,
  validWords: [] as string[],
  tries: [] as Tries,
  showProgression: true,
  playerList: [] as Server.User[],
  scores: {} as ScoreStats,
  hasLoaded: false,
  wasFinishedOnLoad: false,
};

const initialApp = {
  player: defaultPlayer,
};

const useGameStore = create<GameState>((set, get) => ({
  ...initialApp,
  ...initialWorld,
  ...initialSession,
  setSolution: (solution) =>
    set(() => ({
      solution,
    })),
  setValidWords: (validWords) => set({ validWords }),
  setTries: (tries) => set({ tries }),
  addTry: (word) => set((state) => ({ tries: [...(state.tries || []), word] })),
  gameFinished: () => isGameFinished(get().tries),
  setShowProgression: (showProgression) => set({ showProgression }),
  setLetters: (letters) => set({ letters }),
  setPlayer: (updatedPlayer) =>
    set((state) => ({
      player: {
        ...defaultPlayer,
        ...state.player,
        ...updatedPlayer,
      },
    })),
  setXP: (xp) =>
    set((state) => ({
      player: {
        ...state.player,
        xp,
      },
    })),
  setPlayerList: (players) => set({ playerList: players }),
  addPlayer: (player) => set((state) => ({ playerList: [...(state.playerList || []), player] })),
  removePlayer: (playerName) =>
    set((state) => ({
      playerList: state.playerList?.filter((p) => p.name !== playerName) || [],
    })),
  setScores: (scores) => set({ scores }),
  addAchievement: (achievement) =>
    set((state) => ({
      achievements: [...(state.achievements || []), achievement].slice(-5),
    })),
  removeAchievement: (achievementId) =>
    set((state) => ({
      achievements: state.achievements?.filter((a) => a.id !== achievementId) || [],
    })),
  setHasLoaded: (hasLoaded) => set({ hasLoaded }),
  setWasFinishedOnLoad: (wasFinishedOnLoad) => set({ wasFinishedOnLoad }),
  resetSession: () => set(initialSession),
  resetWorld: () => set(initialWorld),
}));

export default useGameStore;
