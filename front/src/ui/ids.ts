export const UI = {
  GAME_MENU: 'game-menu-settings',
  SETTINGS: 'settings',
  RESOURCE_PACKS: 'resource-packs',
  STATS: 'stats',
  CHAT: 'chat',
  TAB: 'tab',
  WORLD_LOADING: 'worldLoading',
} as const;

export type UIId = (typeof UI)[keyof typeof UI];
