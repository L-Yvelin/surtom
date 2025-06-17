import { create } from "zustand";
import { Coordinates, Anchor } from "../components/Tooltip/utils";

interface TooltipState {
  isVisible: boolean;
  position: Coordinates | null;
  content: React.ReactNode;
  anchor: Anchor;
  offset: number;
  triggerElement: HTMLElement | null;
  show: (args: {
    content: React.ReactNode;
    coords: Coordinates;
    anchor?: Anchor;
    offset?: number;
    trigger: HTMLElement;
  }) => void;
  hide: () => void;
  updatePosition: (coords: Coordinates) => void;
}

export const useTooltipStore = create<TooltipState>((set) => ({
  isVisible: false,
  position: null,
  content: null,
  anchor: Anchor.TOP_LEFT,
  offset: 10,
  triggerElement: null,
  show: ({ content, coords, anchor = Anchor.TOP_LEFT, offset = 10, trigger }) =>
    set({
      isVisible: true,
      content,
      position: coords,
      anchor,
      offset,
      triggerElement: trigger,
    }),
  hide: () =>
    set({
      isVisible: false,
      triggerElement: null,
    }),
  updatePosition: (position) =>
    set((state) => {
      if (!state.isVisible) return state;
      return { position };
    }),
}));
