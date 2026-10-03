import { applyTextures } from './minecraft/textures';
import { useResourcePackStore, type ResourcePackInitOptions } from './minecraft/resourcePackStore';

export function initDesignSystem(options: ResourcePackInitOptions = {}): Promise<void> {
  applyTextures({});
  return useResourcePackStore.getState().init(options);
}
