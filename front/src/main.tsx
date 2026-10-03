import ReactDOM from 'react-dom/client';
import { initDesignSystem } from '@surtom/design-system';
import '@surtom/design-system/style.css';
import '@surtom/design-system/fonts.css';
import './index.css';
import './i18n';
import Root from './Root';

const favicon = document.createElement('link');
favicon.rel = 'icon';
favicon.type = 'image/png';
document.head.appendChild(favicon);

void initDesignSystem({
  builtinPacks: [
    {
      id: '__golden_days__',
      url: '/resource-packs/golden-days.zip',
      name: 'Golden Days',
      description: 'Classic textures from before the Java Edition 1.14 overhaul (April 2019)',
      iconTextureKey: 'block/grass_block_side.png',
    },
  ],
});

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(<Root />);
