import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: {
    environment: "node",
    include: ["features/**/*.integration.test.ts"],
    setupFiles: ["./test/integration/setup.ts"],
    pool: "forks",
    fileParallelism: false,
    maxWorkers: 1
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname)
    }
  }
});
