import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  maxWorkers: 1,
  test: {
    environment: "node",
    include: ["features/**/*.integration.test.ts"],
    setupFiles: ["./test/integration/setup.ts"],
    pool: "forks",
    fileParallelism: false
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname)
    }
  }
});
