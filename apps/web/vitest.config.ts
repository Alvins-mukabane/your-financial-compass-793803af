import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react-swc";
import fs from "node:fs";
import os from "node:os";
import path from "path";

const testTmpDir =
  [process.env.TMPDIR, process.env.TEMP, process.env.TMP, os.tmpdir(), "/tmp"].find(
    (dir): dir is string => Boolean(dir) && fs.existsSync(dir),
  ) ?? "/tmp";

process.env.TMPDIR = testTmpDir;
process.env.TEMP = testTmpDir;
process.env.TMP = testTmpDir;

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
});
