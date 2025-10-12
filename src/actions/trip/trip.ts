import { ActionError, defineAction } from "astro:actions";
import { createTripSchema } from "./trip.validation";
import { db } from "@db/index";
import { fishingTrips, locations } from "@db/schema";
import { createAuthorizedHandler } from "src/actions/auth";

export const trip = {
	createTrip: defineAction({
		accept: "json",
		input: createTripSchema,
		handler: createAuthorizedHandler(async (input, context, session) => {
			try {
				// First, create or find a location for this trip
				// For now, we'll create a simple location entry
				const [location] = await db
					.insert(locations)
					.values({
						userId: session.user.id,
						name:
							input.location.name ??
							`Location at ${input.location.latitude.toFixed(4)}, ${input.location.longitude.toFixed(4)}`,
						latitude: input.location.latitude,
						longitude: input.location.longitude,
						description: input.notes || null,
					})
					.returning();

				// Create the fishing trip
				const [newTrip] = await db
					.insert(fishingTrips)
					.values({
						userId: session.user.id,
						locationId: location.id,
						tripDate: input.tripDate,
						startTime: input.startTime || null,
						endTime: input.endTime || null,
						title: input.title || null,
						notes: input.notes || null,
						rating: input.rating || null,
					})
					.returning();

				return {
					success: true,
					message: "Fishing trip created successfully!",
					trip: newTrip,
				};
			} catch (error) {
				if (error instanceof ActionError) {
					throw error;
				}

				console.error("Error creating trip:", error);
				throw new ActionError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Failed to create fishing trip",
				});
			}
		}),
	}),
};
