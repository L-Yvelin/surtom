import ReactDOM from 'react-dom/client';
import './index.css';
import './i18n';
import Root from './Root';
import faviconUrl from '@mc/textures/block/diamond_block.png';

const favicon = document.createElement('link');
favicon.rel = 'icon';
favicon.type = 'image/png';
favicon.href = faviconUrl;
document.head.appendChild(favicon);

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(<Root />);
