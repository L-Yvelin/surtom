import { AchievementProps } from '../features/AchievementsStack/Achievement/Achievement';
import { Tries, Server, Word } from '@surtom/interfaces';
import { ScoreStats } from '../features/Stats/utils/scoreCalculation';
import { create } from 'zustand';

interface GameState {
  solution: string | undefined;
  setSolution: (solution: string) => void;
  validWords: string[];
  setValidWords: (validWords: string[]) => void;
  tries: Tries;
  setTries: (tries: Tries) => void;
  addTry: (word: Word) => void;
  hasPendingTry: boolean;
  setHasPendingTry: (hasPendingTry: boolean) => void;
  letters: Word;
  showProgression: boolean;
  setShowProgression: (showProgression: boolean) => void;
  setLetters: (letters: Word) => void;
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
  hasSharedScore: boolean;
  setHasSharedScore: (hasSharedScore: boolean) => void;
  resetSession: () => void;
  resetWorld: () => void;
}

const initialSession = {
  achievements: [] as AchievementProps[],
  letters: [] as Word,
};

const initialWorld = {
  solution: undefined as string | undefined,
  validWords: [] as string[],
  tries: [] as Tries,
  hasPendingTry: false,
  showProgression: true,
  playerList: [] as Server.User[],
  scores: {} as ScoreStats,
  hasLoaded: false,
  wasFinishedOnLoad: false,
  hasSharedScore: false,
};

export const useGameStore = create<GameState>((set) => ({
  ...initialWorld,
  ...initialSession,
  setSolution: (solution) => set(() => ({ solution })),
  setValidWords: (validWords) => set({ validWords }),
  setTries: (tries) => set({ tries }),
  addTry: (word) => set((state) => ({ tries: [...(state.tries || []), word] })),
  setHasPendingTry: (hasPendingTry) => set({ hasPendingTry }),
  setShowProgression: (showProgression) => set({ showProgression }),
  setLetters: (letters) => set({ letters }),
  setPlayerList: (players) => set({ playerList: players }),
  addPlayer: (player) => set((state) => ({ playerList: [...(state.playerList || []), player] })),
  removePlayer: (playerName) =>
    set((state) => ({
      playerList: state.playerList?.filter((p) => p.name !== playerName) || [],
    })),
  setScores: (scores) => set({ scores }),
  addAchievement: (achievement) =>
    set((state) => ({
      achievements: [...(state.achievements || []), achievement],
    })),
  removeAchievement: (achievementId) =>
    set((state) => ({
      achievements: state.achievements?.filter((a) => a.id !== achievementId) || [],
    })),
  setHasLoaded: (hasLoaded) => set({ hasLoaded }),
  setWasFinishedOnLoad: (wasFinishedOnLoad) => set({ wasFinishedOnLoad }),
  setHasSharedScore: (hasSharedScore) => set({ hasSharedScore }),
  resetSession: () => set(initialSession),
  resetWorld: () => set(initialWorld),
}));
