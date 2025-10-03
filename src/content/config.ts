import { defineCollection, z } from 'astro:content';
import { CATEGORIES } from '@data/categories.const';
import { glob } from "astro/loaders";

const blog = defineCollection({
	loader: glob({
		pattern: "**/*.(md|mdx)",
		base: "./src/content/blog",
		// slug: (entry) => entry.id.replace(/\.[^.]+$/, '')
	}),
	schema: ({ image }) =>
		z.object({
			href: z.string().max(80),
			title: z.string().max(80),
			titleImage: image(),
			previewImage: image(),
			// description: z.string().max(200),
			// Transform string to Date object
			publishedAt: z
				.string()
				.or(z.date())
				.transform((val: Date) => new Date(val)),
			category: z.enum(CATEGORIES),
			searchCategories: z.array(z.string()),
			personal: z.boolean(),
			author: z.string().optional()
		}),
});

export const collections = { blog };
