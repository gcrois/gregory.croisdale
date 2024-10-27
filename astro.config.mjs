import { defineConfig } from 'astro/config';
import react from "@astrojs/react";

export default defineConfig({
  site: 'https://g.regory.dev',
  base: '',
  integrations: [react()],
  experimental: { assets: true },
});