module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  moduleFileExtensions: ["ts", "js"],
  transform: {
    "^.+\\.tsx?$": "ts-jest",
  },
  testRegex: "(/__tests__/.*|(\\.|/)(critical|integration|test|spec))\\.tsx?$",
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
};
