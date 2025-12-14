import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import rehypeExternalLinks from "rehype-external-links";
import mdx from "@astrojs/mdx";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

export default defineConfig({
	site: "https://g.regory.dev",
	base: "",
	integrations: [
		react(),
		sitemap(),
		mdx({
			remarkPlugins: [remarkMath],
			rehypePlugins: [
				rehypeKatex,
				[
					rehypeExternalLinks,
					{
						target: "_blank",
						rel: ["noopener", "noreferrer"],
					},
				],
			],
		}),
	],
	markdown: {
		remarkPlugins: [remarkMath],
		rehypePlugins: [
			rehypeKatex,
			[
				rehypeExternalLinks,
				{
					target: "_blank",
					rel: ["noopener", "noreferrer"],
				},
			],
		],
	},
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
