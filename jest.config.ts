import type { JestConfigWithTsJest } from "ts-jest";

const config: JestConfigWithTsJest = {
  preset: "ts-jest/presets/default-esm",
  testEnvironment: "jsdom",
  globals: { "ts-jest": { useESM: true } },
  extensionsToTreatAsEsm: [".ts"],
};

export default config;
