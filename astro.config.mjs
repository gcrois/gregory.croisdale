import { defineConfig } from 'astro/config';

import image from "@astrojs/image";

// https://astro.build/config
export default defineConfig({
  site: 'https://gregory.croisdale.us',
  base: '',
  integrations: [image()]
});