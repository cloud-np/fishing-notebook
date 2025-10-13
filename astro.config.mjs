import { defineConfig } from "astro/config";
import { settings } from "./src/settings.const";
import sitemap from "@astrojs/sitemap";
import mdx from "@astrojs/mdx";
import icon from "astro-icon";
import svelte from "@astrojs/svelte";

import partytown from "@astrojs/partytown";

import node from "@astrojs/node";

import tailwindcss from "@tailwindcss/vite";
import playformCompress from "@playform/compress";

export default defineConfig({
	site: settings.url,
	integrations: [
		sitemap(),
		mdx(),
		icon({
			iconDir: "src/assets/icons",
		}),
		svelte({ extensions: [".svelte"] }),
		partytown({
			config: {
				forward: ["gtag", "dataLayer.push"], // Needed for GA
			},
		}),
		playformCompress(),
	],
	vite: {
		ssr: {
			external: ["svgo"],
		},
		resolve: {
			conditions: ["browser"],
		},
		plugins: [
			tailwindcss({
				applyBaseStyles: false,
			}),
		],
	},
	prefetch: {
		defaultStrategy: "hover",
		prefetchAll: true,
	},
	output: "static",
	plugins: [],
	adapter: node({
		mode: "standalone",
	}),
});
