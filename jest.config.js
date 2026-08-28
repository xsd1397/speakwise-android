module.exports = {
  preset: "jest-expo",
  rootDir: __dirname,
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
  },
  testMatch: ["<rootDir>/**/*.component.test.tsx"],
  testPathIgnorePatterns: ["/node_modules/", "/dist/", "/android/"],
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
};
