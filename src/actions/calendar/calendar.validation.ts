import { z } from "astro:schema";

export const dateSchema = z.object({
	date: z.string().date(),
	latitude: z.number().min(-90).max(90),
	longitude: z.number().min(-180).max(180),
});
