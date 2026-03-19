import { defineConfig } from "vite-plus";

export default defineConfig({
  build: {
    target: "esnext",
  },
  optimizeDeps: {
    exclude: ["@dimforge/rapier2d-compat"],
  },
});
