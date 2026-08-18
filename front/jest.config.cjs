/** @type {import("jest").Config} **/
module.exports = {
  testEnvironment: 'node',
  transform: {
    // Files using Vite-only import.meta.glob get a custom transform that strips those calls first
    '^.+/src/mc/[^/]+\\.tsx?$': '<rootDir>/jest.importMetaGlobTransform.cjs',
    // Files reading Vite-only import.meta.env get a custom transform that rewrites to process.env
    '^.+/src/stores/useWebSocketStore\\.ts$': '<rootDir>/jest.importMetaEnvTransform.cjs',
    '^.+\\.[jt]sx?$': [
      'ts-jest',
      {
        tsconfig: {
          allowJs: true,
          esModuleInterop: true,
          resolveJsonModule: true,
          jsx: 'react-jsx',
        },
      },
    ],
  },
  moduleNameMapper: {
    '\\.module\\.css$': '<rootDir>/jest.styleMock.cjs',
    '\\.(png|jpg|jpeg|gif|svg|webp|avif|mp3|wav|woff2?|ttf)$': '<rootDir>/jest.assetMock.cjs',
  },
};
