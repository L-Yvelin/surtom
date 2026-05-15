import React, { Suspense, useEffect, useState } from 'react';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import Loading from './ui/BootSplash/BootSplash';

const SPLASH_DELAY_MS = 1000;

function Root(): React.JSX.Element {
  const [haveAssetsLoaded, setHaveAssetsLoaded] = useState(false);
  const [showLoading, setShowLoading] = useState(true);

  useEffect(() => {
    if (!haveAssetsLoaded) return;
    const timer = setTimeout(() => setShowLoading(false), SPLASH_DELAY_MS);
    return () => clearTimeout(timer);
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
}

export default Root;
