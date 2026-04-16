/** @type {import("jest").Config} **/
module.exports = {
  testEnvironment: 'node',
  transform: {
    '^.+\\.[jt]sx?$': ['ts-jest', { tsconfig: { allowJs: true, esModuleInterop: true } }],
  },
};
