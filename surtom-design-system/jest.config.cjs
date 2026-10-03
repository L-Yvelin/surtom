/** @type {import("jest").Config} **/
module.exports = {
  testEnvironment: 'node',
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
  transform: {
    '^.+/src/minecraft/[^/]+\\.tsx?$': '<rootDir>/jest.importMetaGlobTransform.cjs',
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
    '\\.(png|jpg|jpeg|gif|svg|webp|avif|mp3|wav|woff2?|ttf|otf)$': '<rootDir>/jest.assetMock.cjs',
  },
};
