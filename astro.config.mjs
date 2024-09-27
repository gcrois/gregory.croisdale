import { defineConfig } from 'astro/config';
import image from "@astrojs/image";
import react from "@astrojs/react";

export default defineConfig({
  site: 'https://g.regory.dev',
  base: '',
  integrations: [image(), react()]
});