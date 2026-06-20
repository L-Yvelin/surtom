import ReactDOM from 'react-dom/client';
import './index.css';
import './i18n';
import Root from './Root';
import { applyTextures } from './mc/textures';
import useResourcePackStore from './stores/useResourcePackStore';

const favicon = document.createElement('link');
favicon.rel = 'icon';
favicon.type = 'image/png';
document.head.appendChild(favicon);

applyTextures({});
void useResourcePackStore.getState().init();

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(<Root />);
