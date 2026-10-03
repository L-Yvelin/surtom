# @surtom/design-system

Minecraft-inspired design system for Surtom. It isolates everything that copies the Minecraft look: components, textures, block models, the resource pack engine, fonts and sounds.

## Consuming

The package is a prebuilt ESM library (`vite build` in library mode, plus `.d.ts` files). `front` consumes `dist/`, so build it before using it:

```bash
npm run build --workspace=surtom-design-system
```

```tsx
import { DesignSystemProvider, initDesignSystem, Button } from '@surtom/design-system';
import '@surtom/design-system/style.css';
import '@surtom/design-system/fonts.css';

void initDesignSystem({ builtinPacks: [] });

root.render(
  <DesignSystemProvider soundEnabled>
    <Button text="Play" onClick={play} />
  </DesignSystemProvider>,
);
```

- `style.css` holds the component styles and the design tokens (`--mc-px`, `--button-height`, `--z-*`, ...).
- `fonts.css` declares the `minecraft`, `minecraft-chat` and `Chinese` font faces. It is kept separate from `style.css` so the consuming bundler emits the font files instead of inlining them.
- `initDesignSystem` applies the default textures as `--mc-*` CSS variables and loads the resource packs. Built-in packs are provided by the app.
- `DesignSystemProvider` provides the tooltip layer and the `soundEnabled` flag used by sounds (button clicks, level up).

## Contents

| Area             | Exports                                                                                          |
| ---------------- | ------------------------------------------------------------------------------------------------ |
| Controls         | `Button`, `ButtonRow`, `TextField`, `BeaconKey`, `Marquee`                                       |
| Surfaces         | `Screen`, `Backdrop`, `Chest`, `BlockTile`, `BlockBar`                                           |
| Feedback         | `Tooltip`, `MinecraftTooltip`, `AchievementToast`, `SlideInOut`, `ExperienceBar`                 |
| 3D blocks        | `BlockModel`, `RowBlockModel`                                                                    |
| Textures & packs | `TEXTURES`, `applyTextures`, `resolveTexture`, `useTexture`, `useResourcePackStore`, `parsePack` |
| Misc             | `DesignSystemProvider`, `useDesignSystem`, `initDesignSystem`, `createSoundPlayer`               |

Components are controlled and have no knowledge of the application (no router, i18n or app stores): labels, visibility and sound are passed as props or through `DesignSystemProvider`.

## Minecraft assets

Textures and block models come from the Minecraft client jar. They are not committed: `npm run assets` downloads them into `vendors/minecraft/` (gitignored) and runs automatically before `npm run build`. Use `MC_FORCE=1 npm run assets` to re-download.

All textures are registered in `src/minecraft/textures.ts`. Textures with a `cssVar` are exposed as `--mc-*` CSS variables, so CSS must reference them through `var(--mc-...)` and never import the `@mc` alias directly. This is enforced by `src/minecraft/textures.test.ts` and by ESLint.

## Scripts

| Script              | What it does                                                        |
| ------------------- | ------------------------------------------------------------------- |
| `npm run build`     | Fetch assets, build JS and CSS, emit types, copy fonts into `dist/` |
| `npm run dev`       | Rebuild JS and CSS on change                                        |
| `npm run lint`      | ESLint                                                              |
| `npm run typecheck` | TypeScript without emit                                             |
| `npm test`          | Jest                                                                |

## Adding a component

1. Create `src/components/<Name>/<Name>.tsx` and `<Name>.module.css`. Use named exports.
2. Take styling variations through props and text through props. Do not import app code.
3. Reference textures through `var(--mc-...)`. Register new textures in `src/minecraft/textures.ts`.
4. Export the component and its prop types from `src/index.ts`.
