import dirt from '@mc/textures/block/dirt.png';
import netherrack from '@mc/textures/block/netherrack.png';
import diamondBlock from '@mc/textures/block/diamond_block.png';
import goldBlock from '@mc/textures/block/gold_block.png';
import stone from '@mc/textures/block/stone.png';
import sand from '@mc/textures/block/sand.png';
import gravel from '@mc/textures/block/gravel.png';
import itemFrame from '@mc/textures/block/item_frame.png';
import grassBlockSide from '@mc/textures/block/grass_block_side.png';
import grassBlockTop from '@mc/textures/block/grass_block_top.png';
import grassBlockSideOverlay from '@mc/textures/block/grass_block_side_overlay.png';
import warpedNylium from '@mc/textures/block/warped_nylium.png';
import warpedNyliumSide from '@mc/textures/block/warped_nylium_side.png';
import redstoneLamp from '@mc/textures/block/redstone_lamp.png';
import redstoneLampOn from '@mc/textures/block/redstone_lamp_on.png';
import book from '@mc/textures/item/book.png';
import stick from '@mc/textures/item/stick.png';
import paintingMeditative from '@mc/textures/painting/meditative.png';
import textField from '@mc/textures/gui/sprites/widget/text_field.png';
import textFieldHighlighted from '@mc/textures/gui/sprites/widget/text_field_highlighted.png';
import button from '@mc/textures/gui/sprites/widget/button.png';
import buttonHighlighted from '@mc/textures/gui/sprites/widget/button_highlighted.png';
import buttonDisabled from '@mc/textures/gui/sprites/widget/button_disabled.png';
import experienceBarBackground from '@mc/textures/gui/sprites/hud/experience_bar_background.png';
import experienceBarProgress from '@mc/textures/gui/sprites/hud/experience_bar_progress.png';
import socialInteractions from '@mc/textures/gui/sprites/toast/social_interactions.png';
import friends from '@mc/textures/gui/sprites/friends/friends.png';
import notificationMore from '@mc/textures/gui/sprites/notification/more.png';
import beaconButton from '@mc/textures/gui/sprites/container/beacon/button.png';
import beaconButtonHighlighted from '@mc/textures/gui/sprites/container/beacon/button_highlighted.png';
import beaconButtonSelected from '@mc/textures/gui/sprites/container/beacon/button_selected.png';
import advancement from '@mc/textures/gui/sprites/toast/advancement.png';
import tooltipBackground from '@mc/textures/gui/sprites/tooltip/background.png';
import tooltipFrame from '@mc/textures/gui/sprites/tooltip/frame.png';
import generic54 from '@mc/textures/gui/container/generic_54.png';

export interface NineSlicePcts {
  top: number;
  right: number;
  bottom: number;
  left: number;
  topPx: number;
  rightPx: number;
  bottomPx: number;
  leftPx: number;
}

export interface SpriteMcmeta {
  gui?: {
    scaling?: {
      type: string;
      width: number;
      height: number;
      border: number | { left: number; right: number; top: number; bottom: number };
    };
  };
}

export function parseMcmetaNineSlice(meta: SpriteMcmeta): NineSlicePcts | undefined {
  const s = meta?.gui?.scaling;
  if (s?.type !== 'nine_slice') return undefined;
  const { border, width, height } = s;
  const topPx = typeof border === 'number' ? border : border.top;
  const rightPx = typeof border === 'number' ? border : border.right;
  const bottomPx = typeof border === 'number' ? border : border.bottom;
  const leftPx = typeof border === 'number' ? border : border.left;
  return {
    top: (topPx / height) * 100,
    right: (rightPx / width) * 100,
    bottom: (bottomPx / height) * 100,
    left: (leftPx / width) * 100,
    topPx,
    rightPx,
    bottomPx,
    leftPx,
  };
}

const rawMcmetas = import.meta.glob('../../vendors/minecraft/textures/**/*.png.mcmeta', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

function getNineSlice(texturePath: string): NineSlicePcts | undefined {
  const raw = rawMcmetas[`../../vendors/minecraft/textures/${texturePath}.mcmeta`];
  if (!raw) return undefined;
  return parseMcmetaNineSlice(JSON.parse(raw) as SpriteMcmeta);
}

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
  'block/grass_block_top.png': { default: grassBlockTop },
  'block/grass_block_side_overlay.png': { default: grassBlockSideOverlay },
  'block/warped_nylium.png': { default: warpedNylium },
  'block/warped_nylium_side.png': { default: warpedNyliumSide, cssVar: '--mc-warped-nylium-side' },
  'block/redstone_lamp.png': { default: redstoneLamp },
  'block/redstone_lamp_on.png': { default: redstoneLampOn },
  'item/book.png': { default: book },
  'item/stick.png': { default: stick },
  'painting/meditative.png': { default: paintingMeditative },
  'gui/sprites/widget/text_field.png': { default: textField, cssVar: '--mc-text-field' },
  'gui/sprites/widget/text_field_highlighted.png': { default: textFieldHighlighted, cssVar: '--mc-text-field-highlighted' },
  'gui/sprites/widget/button.png': { default: button, cssVar: '--mc-button' },
  'gui/sprites/widget/button_highlighted.png': { default: buttonHighlighted, cssVar: '--mc-button-highlighted' },
  'gui/sprites/widget/button_disabled.png': { default: buttonDisabled, cssVar: '--mc-button-disabled' },
  'gui/sprites/toast/advancement.png': { default: advancement, cssVar: '--mc-advancement' },
  'gui/sprites/tooltip/background.png': { default: tooltipBackground, cssVar: '--mc-tooltip-bg' },
  'gui/sprites/tooltip/frame.png': { default: tooltipFrame, cssVar: '--mc-tooltip-frame' },
  'gui/sprites/hud/experience_bar_background.png': { default: experienceBarBackground },
  'gui/sprites/hud/experience_bar_progress.png': { default: experienceBarProgress },
  'gui/sprites/toast/social_interactions.png': { default: socialInteractions },
  'gui/sprites/friends/friends.png': { default: friends },
  'gui/sprites/notification/more.png': { default: notificationMore },
  'gui/sprites/container/beacon/button.png': { default: beaconButton, cssVar: '--mc-beacon-button' },
  'gui/sprites/container/beacon/button_highlighted.png': { default: beaconButtonHighlighted, cssVar: '--mc-beacon-button-highlighted' },
  'gui/sprites/container/beacon/button_selected.png': { default: beaconButtonSelected, cssVar: '--mc-beacon-button-selected' },
  'gui/container/generic_54.png': { default: generic54, cssVar: '--mc-generic-54' },
} satisfies Record<string, TextureEntry>;

export type TextureKey = keyof typeof TEXTURES;

export const FAVICON_TEXTURE: TextureKey = 'block/diamond_block.png';

export const USED_TEXTURE_PATHS = Object.keys(TEXTURES) as TextureKey[];

export type TextureOverrides = Record<string, string>;

const TEXTURES_MAP = TEXTURES as Record<string, TextureEntry | undefined>;

export function getTextureDefault(path: string): string | undefined {
  return TEXTURES_MAP[path]?.default;
}

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

export type McmetaOverrides = Record<string, NineSlicePcts>;

export function applyTextures(overrides: TextureOverrides, mcmetaOverrides: McmetaOverrides = {}): void {
  const rootStyle = document.documentElement.style;
  for (const [path, entry] of Object.entries(TEXTURES) as [string, TextureEntry][]) {
    if (!entry.cssVar) continue;
    rootStyle.setProperty(entry.cssVar, `url("${overrides[path] ?? entry.default}")`);
    const slice = mcmetaOverrides[path] ?? getNineSlice(path);
    if (slice) {
      const { top, right, bottom, left, topPx } = slice;
      rootStyle.setProperty(`${entry.cssVar}-slice`, `${top}% ${right}% ${bottom}% ${left}%`);
      rootStyle.setProperty(`${entry.cssVar}-border-px`, String(topPx));
    }
  }

  const favicon = document.querySelector<HTMLLinkElement>("link[rel~='icon']");
  if (favicon) favicon.href = resolveTexture(FAVICON_TEXTURE, overrides);

  void applyDerivedColors(overrides);
}
