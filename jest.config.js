module.exports = {
  globals: {
    "ts-jest": {
      "astTransformers": ["ts-nameof"]
    }
  },
  roots: [
    "<rootDir>/src"
  ],
  transform: {
    "^.+\\.(ts|tsx)$": "ts-jest"
  },
  testMatch: [
    "**/__tests__/**/*.+(ts|tsx|js)",
    "**/?(*.)+(spec|test).+(ts|tsx|js)"
  ]
}
