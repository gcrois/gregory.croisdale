import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
	site: "https://g.regory.dev",
	base: "",
	integrations: [react(), sitemap()],
	vite: {
		// Force worker to use ES modules instead of iife
		worker: {
			format: "es",
		},
		build: {
			rollupOptions: {
				// Ensure the main bundle also uses ES modules
				output: {
					format: "es",
				},
			},
		},
		optimizeDeps: {
			exclude: ["@jsquash/jxl", "@jsquash/png"],
			include: ["qrcode.react"],
		},
	},
});
