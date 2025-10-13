import { ActionError, defineAction } from "astro:actions";
import { createTripSchema } from "./trip.validation";
import { db } from "@db/index";
import { fishingTrips } from "@db/schema";
import { createAuthorizedHandler } from "src/actions/auth";
import { eq } from "drizzle-orm";
import { createOrUpdateLocation } from "@db/locations/locations";

export const trip = {
	createTrip: defineAction({
		accept: "json",
		input: createTripSchema,
		handler: createAuthorizedHandler(async (input, context, session) => {
			try {
				// Use context.callAction to create or update the location
				const [location] = await createOrUpdateLocation(
					{
						name: input.location.name,
						latitude: input.location.latitude,
						longitude: input.location.longitude,
						carDifficulty: input.location.carDifficulty,
						walkDifficulty: input.location.walkDifficulty,
						rating: input.location.rating,
					},
					session.user.id
				);

				// Create the fishing trip
				const [newTrip] = await db
					.insert(fishingTrips)
					.values({
						userId: session.user.id,
						locationId: location.id,
						tripDate: input.tripDate,
						startTime: input.startTime || undefined,
						endTime: input.endTime || undefined,
						title: input.title || undefined,
						notes: input.notes || undefined,
						rating: input.rating || undefined,
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
	getTrips: defineAction({
		accept: "json",
		handler: createAuthorizedHandler(async (_, context, session) => {
			try {
				const trips = await db.query.fishingTrips.findMany({
					where: eq(fishingTrips.userId, session.user.id),
					with: {
						location: true,
					},
				});

				return {
					success: true,
					message: "Fishing trips retrieved successfully!",
					trips,
				};
			} catch (error) {
				if (error instanceof ActionError) {
					throw error;
				}

				console.error("Error retrieving trips:", error);
				throw new ActionError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Failed to retrieve fishing trips",
				});
			}
		}),
	}),
};
