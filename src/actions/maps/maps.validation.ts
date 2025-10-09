import { z } from "astro:schema";

export const mapsUrlSchema = z.object({
	url: z.string().url("Invalid URL format"),
});

export type MapsUrlInput = z.infer<typeof mapsUrlSchema>;
