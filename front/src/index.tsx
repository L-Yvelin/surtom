import React, { Suspense, useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import Loading from "./components/Loading/Loading";

const RootComponent = () => {
  const [isAppLoaded, setIsAppLoaded] = useState(false);
  const [showLoading, setShowLoading] = useState(true);

  useEffect(() => {
    if (isAppLoaded) {
      setTimeout(() => setShowLoading(false), 1000);
    }
  }, [isAppLoaded]);

  return (
    <React.StrictMode>
      {showLoading && <Loading display={!isAppLoaded} />}
      <Suspense fallback={<></>}>
        <App onLoad={() => setIsAppLoaded(true)} />
      </Suspense>
    </React.StrictMode>
  );
};

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
root.render(<RootComponent />);
