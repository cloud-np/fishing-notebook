import { z } from "astro:schema";

export const createTripSchema = z.object({
	location: z.object({
		name: z.string().max(200).optional(),
		latitude: z.number().min(-90).max(90, "Latitude must be between -90 and 90"),
		longitude: z.number().min(-180).max(180, "Longitude must be between -180 and 180"),
		walkDifficulty: z.number().min(1).max(5).optional(),
		carDifficulty: z.number().min(1).max(5).optional(),
		rating: z.number().min(1).max(5).optional(),
	}),
	tripDate: z.string().min(1, "Trip date is required"),
	rating: z.number().min(1).max(5).optional(),
	notes: z.string().max(2000).optional(),
	title: z.string().max(200).optional(),
	startTime: z.string().optional(),
	endTime: z.string().optional(),
	successRating: z.number().min(1).max(5).optional(),
});

export const getTripsByDateSchema = z.object({
	startDate: z.string().min(1, "Start date is required"),
	endDate: z.string().min(1, "End date is required"),
	limit: z.number().int().positive().max(1000).default(1000),
});
