import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  // No GitHub Pages o site fica em /Falares/; localmente e no `npm start`, na raiz.
  base: process.env.BASE_PATH ?? "/",
  plugins: [react()],
  server: {
    proxy: { "/api": "http://localhost:3001" },
  },
});
