import { defineConfig } from "vitest/config"

export default defineConfig({
  test: {
    include: ["src/**/*.test.ts", "scripts/**/*.test.ts"],
    globals: false,
    coverage: {
      provider: "v8",
      include: ["src/**/*.ts"],
      exclude: ["src/**/*.test.ts"],
      reporter: ["text-summary", "json-summary", "html"],
      // Just below the measured suite, so coverage can rise and not fall.
      thresholds: {
        lines: 99,
        statements: 99,
        functions: 99,
        branches: 98,
        perFile: { lines: 50 },
      },
    },
  },
})
