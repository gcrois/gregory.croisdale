import { defineConfig } from 'astro/config';
import react from "@astrojs/react";

import sitemap from "@astrojs/sitemap";

export default defineConfig({
  site: 'https://g.regory.dev',
  base: '',
  integrations: [
    react(),
    sitemap({
      xslURL: '/sitemap.xsl'
    })
  ],
  vite: {
    css: {
        preprocessorOptions: {
            scss: {
                api: "modern-compiler"
            }
        }
    }
  }
});