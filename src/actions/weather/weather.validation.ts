import { z } from "astro:schema";

export const getWeatherByDateSchema = z.object({
	date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
	latitude: z.number().min(-90).max(90),
	longitude: z.number().min(-180).max(180),
});
