import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 4200,
    strictPort: true,
  },
  resolve: {
    alias: {
      "@": "/src",
      metronic: "/metronic",
      "@api": "/src/api",
      "@hooks": "/src/hooks",
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@import "metronic/assets/sass/_init.scss";`,
        silenceDeprecations: [
          "legacy-js-api",
          "import",
          "global-builtin",
          "color-functions",
          "if-function",
        ],
        quietDeps: true,
        verbose: false,
      },
    },
  },
});
