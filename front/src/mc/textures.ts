import dirt from '@mc/textures/block/dirt.png';
import netherrack from '@mc/textures/block/netherrack.png';
import diamondBlock from '@mc/textures/block/diamond_block.png';
import goldBlock from '@mc/textures/block/gold_block.png';
import stone from '@mc/textures/block/stone.png';
import sand from '@mc/textures/block/sand.png';
import gravel from '@mc/textures/block/gravel.png';
import itemFrame from '@mc/textures/block/item_frame.png';
import grassBlockSide from '@mc/textures/block/grass_block_side.png';
import warpedNyliumSide from '@mc/textures/block/warped_nylium_side.png';
import redstoneLamp from '@mc/textures/block/redstone_lamp.png';
import redstoneLampOn from '@mc/textures/block/redstone_lamp_on.png';
import book from '@mc/textures/item/book.png';
import stick from '@mc/textures/item/stick.png';
import textField from '@mc/textures/gui/sprites/widget/text_field.png';
import textFieldHighlighted from '@mc/textures/gui/sprites/widget/text_field_highlighted.png';
import button from '@mc/textures/gui/sprites/widget/button.png';
import buttonHighlighted from '@mc/textures/gui/sprites/widget/button_highlighted.png';
import buttonDisabled from '@mc/textures/gui/sprites/widget/button_disabled.png';
import experienceBarBackground from '@mc/textures/gui/sprites/hud/experience_bar_background.png';
import experienceBarProgress from '@mc/textures/gui/sprites/hud/experience_bar_progress.png';
import socialInteractions from '@mc/textures/gui/sprites/toast/social_interactions.png';
import friends from '@mc/textures/gui/sprites/friends/friends.png';
import beaconButton from '@mc/textures/gui/sprites/container/beacon/button.png';
import beaconButtonHighlighted from '@mc/textures/gui/sprites/container/beacon/button_highlighted.png';
import beaconButtonSelected from '@mc/textures/gui/sprites/container/beacon/button_selected.png';

interface TextureEntry {
  default: string;
  cssVar?: string;
}

export const TEXTURES = {
  'block/dirt.png': { default: dirt, cssVar: '--mc-dirt' },
  'block/netherrack.png': { default: netherrack, cssVar: '--mc-netherrack' },
  'block/diamond_block.png': { default: diamondBlock, cssVar: '--mc-diamond-block' },
  'block/gold_block.png': { default: goldBlock, cssVar: '--mc-gold-block' },
  'block/stone.png': { default: stone, cssVar: '--mc-stone' },
  'block/sand.png': { default: sand, cssVar: '--mc-sand' },
  'block/gravel.png': { default: gravel, cssVar: '--mc-gravel' },
  'block/item_frame.png': { default: itemFrame, cssVar: '--mc-item-frame' },
  'block/grass_block_side.png': { default: grassBlockSide, cssVar: '--mc-grass-block-side' },
  'block/warped_nylium_side.png': { default: warpedNyliumSide, cssVar: '--mc-warped-nylium-side' },
  'block/redstone_lamp.png': { default: redstoneLamp },
  'block/redstone_lamp_on.png': { default: redstoneLampOn },
  'item/book.png': { default: book },
  'item/stick.png': { default: stick },
  'gui/sprites/widget/text_field.png': { default: textField, cssVar: '--mc-text-field' },
  'gui/sprites/widget/text_field_highlighted.png': { default: textFieldHighlighted, cssVar: '--mc-text-field-highlighted' },
  'gui/sprites/widget/button.png': { default: button, cssVar: '--mc-button' },
  'gui/sprites/widget/button_highlighted.png': { default: buttonHighlighted, cssVar: '--mc-button-highlighted' },
  'gui/sprites/widget/button_disabled.png': { default: buttonDisabled, cssVar: '--mc-button-disabled' },
  'gui/sprites/hud/experience_bar_background.png': { default: experienceBarBackground },
  'gui/sprites/hud/experience_bar_progress.png': { default: experienceBarProgress },
  'gui/sprites/toast/social_interactions.png': { default: socialInteractions },
  'gui/sprites/friends/friends.png': { default: friends },
  'gui/sprites/container/beacon/button.png': { default: beaconButton, cssVar: '--mc-beacon-button' },
  'gui/sprites/container/beacon/button_highlighted.png': { default: beaconButtonHighlighted, cssVar: '--mc-beacon-button-highlighted' },
  'gui/sprites/container/beacon/button_selected.png': { default: beaconButtonSelected, cssVar: '--mc-beacon-button-selected' },
} satisfies Record<string, TextureEntry>;

export type TextureKey = keyof typeof TEXTURES;

export const FAVICON_TEXTURE: TextureKey = 'block/diamond_block.png';

export const USED_TEXTURE_PATHS = Object.keys(TEXTURES) as TextureKey[];

export type TextureOverrides = Record<string, string>;

export function resolveTexture(path: string, overrides: TextureOverrides): string {
  const entry = (TEXTURES as Record<string, TextureEntry | undefined>)[path];
  return overrides[path] ?? entry?.default ?? '';
}

async function computeAvgColor(url: string): Promise<[number, number, number]> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0);
      const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
      let r = 0,
        g = 0,
        b = 0,
        count = 0;
      for (let i = 0; i < data.length; i += 4) {
        if (data[i + 3] > 0) {
          r += data[i];
          g += data[i + 1];
          b += data[i + 2];
          count++;
        }
      }
      resolve(count ? [Math.round(r / count), Math.round(g / count), Math.round(b / count)] : [128, 128, 128]);
    };
    img.onerror = () => resolve([128, 128, 128]);
    img.src = url;
  });
}

async function applyDerivedColors(overrides: TextureOverrides): Promise<void> {
  const [correct, misplaced] = await Promise.all([
    computeAvgColor(resolveTexture('block/diamond_block.png', overrides)),
    computeAvgColor(resolveTexture('block/gold_block.png', overrides)),
  ]);
  const root = document.documentElement.style;
  root.setProperty('--mc-correct-glow', `rgba(${correct.join(',')}, 0.45)`);
  root.setProperty('--mc-misplaced-glow', `rgba(${misplaced.join(',')}, 0.45)`);
  root.setProperty('--mc-correct-color', `rgb(${correct.join(',')})`);
  root.setProperty('--mc-misplaced-color', `rgb(${misplaced.join(',')})`);
}

export function applyTextures(overrides: TextureOverrides): void {
  const rootStyle = document.documentElement.style;
  for (const [path, entry] of Object.entries(TEXTURES) as [string, TextureEntry][]) {
    if (!entry.cssVar) continue;
    rootStyle.setProperty(entry.cssVar, `url("${overrides[path] ?? entry.default}")`);
  }

  const favicon = document.querySelector<HTMLLinkElement>("link[rel~='icon']");
  if (favicon) favicon.href = resolveTexture(FAVICON_TEXTURE, overrides);

  void applyDerivedColors(overrides);
}
