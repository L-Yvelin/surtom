/// <reference types="vite/client" />
/// <reference types="vite-plugin-svgr/client" />

interface ImportMetaEnv {
  readonly VITE_WEBSOCKET_PROTOCOL: string;
  readonly VITE_WEBSOCKET_HOST: string;
  readonly VITE_WEBSOCKET_PORT: string;
  readonly VITE_WEBSOCKET_PATH: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
