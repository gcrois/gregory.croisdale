import { defineConfig } from 'astro/config';
import react from "@astrojs/react";

export default defineConfig({
  site: 'https://g.regory.dev',
  base: '',
  integrations: [react()],
  vite: {
    // Force worker to use ES modules instead of iife
    worker: {
      format: 'es'
    },
    build: {
      rollupOptions: {
        // Ensure the main bundle also uses ES modules
        output: {
          format: 'es',
        },
      },
    },
    ssr: {
      // If necessary, ensure @jsquash/jxl isn't externalized
      noExternal: ['@jsquash/jxl', '@jsquash/png']
    }
  }
});
