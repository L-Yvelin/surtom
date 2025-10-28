import React, { Suspense, useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import Loading from './components/Loading/Loading';
import useGameStore from './stores/useGameStore';

const RootComponent = () => {
  const [haveAssetsLoaded, setHaveAssetsLoaded] = useState(false);
  const [showLoading, setShowLoading] = useState(false);
  const { hasLoaded: hasReceivedDailyWords } = useGameStore();

  useEffect(() => {
    if (haveAssetsLoaded && hasReceivedDailyWords) {
      setTimeout(() => setShowLoading(false), 1000);
    }
  }, [haveAssetsLoaded, hasReceivedDailyWords]);

  return (
    <React.StrictMode>
      {showLoading && <Loading display={!haveAssetsLoaded || !hasReceivedDailyWords} />}
      <Suspense fallback={<></>}>
        <App onLoad={() => setHaveAssetsLoaded(true)} />
      </Suspense>
    </React.StrictMode>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(<RootComponent />);
