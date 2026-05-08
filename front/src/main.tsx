import React, { Suspense, useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import './i18n';
import App from './App';
import Loading from './ui/BootSplash/BootSplash';

const RootComponent = () => {
  const [haveAssetsLoaded, setHaveAssetsLoaded] = useState(false);
  const [showLoading, setShowLoading] = useState(true);

  useEffect(() => {
    if (haveAssetsLoaded) {
      setTimeout(() => setShowLoading(false), 1000);
    }
  }, [haveAssetsLoaded]);

  return (
    <React.StrictMode>
      <BrowserRouter>
        {showLoading && <Loading display={!haveAssetsLoaded} />}
        <Suspense fallback={<></>}>
          <App onLoad={() => setHaveAssetsLoaded(true)} />
        </Suspense>
      </BrowserRouter>
    </React.StrictMode>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(<RootComponent />);
