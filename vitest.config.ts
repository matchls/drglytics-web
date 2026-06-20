import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    // Répertoire des tests pour ne pas mélanger avec les fichiers app/
    include: ["lib/**/*.test.ts"],
  },
  resolve: {
    // Résolution de l'alias @/ (identique à tsconfig.json)
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
});
