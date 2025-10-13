import { ActionError, defineAction } from "astro:actions";
import { db } from "@db/index";
import { locations } from "@db/schema";
import { createAuthorizedHandler } from "src/actions/auth";
import { eq, sql } from "drizzle-orm";
import { z } from "astro:schema";
import type { Location } from "@types";
import { createOrUpdateLocation } from "@db/locations/locations";

const createLocationSchema = z.object({
	name: z.string().optional(),
	latitude: z.number(),
	longitude: z.number(),
	carDifficulty: z.number().optional(),
	walkDifficulty: z.number().optional(),
	rating: z.number().optional(),
});

export const location = {
	createLocation: defineAction({
		accept: "json",
		input: createLocationSchema,
		handler: createAuthorizedHandler(async (input, context, session) => {
			try {
				const location = await createOrUpdateLocation(
					{
						name: input.name,
						latitude: input.latitude,
						longitude: input.longitude,
						carDifficulty: input.carDifficulty,
						walkDifficulty: input.walkDifficulty,
						rating: input.rating,
					},
					session.user.id
				)?.[0];

				return {
					success: true,
					message: "Location saved successfully!",
					location,
				};
			} catch (error) {
				if (error instanceof ActionError) {
					throw error;
				}

				console.error("Error creating/updating location:", error);
				throw new ActionError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Failed to create or update location",
				});
			}
		}),
	}),
	getLocations: defineAction({
		accept: "json",
		handler: createAuthorizedHandler(async (_, context, session) => {
			try {
				const locationsData = await db.query.locations.findMany({
					where: eq(locations.userId, session.user.id),
				});

				// Map to Location interface without exposing IDs and userIds
				const userLocations: Location[] = locationsData.map(loc => ({
					name: loc.name,
					latitude: loc.latitude,
					longitude: loc.longitude,
					carDifficulty: loc.carDifficulty || undefined,
					walkDifficulty: loc.walkDifficulty || undefined,
					rating: loc.rating || undefined,
				}));

				return {
					success: true,
					message: "Locations retrieved successfully!",
					locations: userLocations,
				};
			} catch (error) {
				if (error instanceof ActionError) {
					throw error;
				}

				console.error("Error retrieving locations:", error);
				throw new ActionError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Failed to retrieve locations",
				});
			}
		}),
	}),
};
