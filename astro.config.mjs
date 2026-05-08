import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";
import node from "@astrojs/node";
import { remarkCitations } from "./src/plugins/remark-citations";

const base = process.env.PUBLIC_BASE_PATH || "/";

export default defineConfig({
  output: "server",
  adapter: node({
    mode: "standalone",
  }),
  base,
  integrations: [react()],
  markdown: {
    remarkPlugins: [remarkCitations],
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
