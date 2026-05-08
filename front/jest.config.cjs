/** @type {import("jest").Config} **/
module.exports = {
  testEnvironment: 'node',
  transform: {
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
