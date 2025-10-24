import { ActionError, defineAction } from "astro:actions";
import { createTripSchema, getTripsByDateSchema } from "./trip.validation";
import { db } from "@db/index";
import { fishingTrips } from "@db/schema";
import { createAuthorizedHandler } from "src/actions/auth";
import { eq, and, gte, lte } from "drizzle-orm";
import { createOrUpdateLocation } from "@db/locations/locations";
import type { Trip, TripsByDate } from "src/types/Trip.model";
import type { Location } from "src/types/Location.model";
import { getWeatherService } from "@libs/services";

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

				// Fetch and save hourly weather data
				await getWeatherService().fetchAndSaveHourlyWeather(
					input.tripDate,
					location.latitude,
					location.longitude
				);

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
				const dbTrips = await db.query.fishingTrips.findMany({
					where: eq(fishingTrips.userId, session.user.id),
					with: {
						location: true,
					},
				});

				const trips: Trip[] = dbTrips.map(dbTrip => ({
					tripDate: dbTrip.tripDate,
					startTime: dbTrip.startTime ?? undefined,
					endTime: dbTrip.endTime ?? undefined,
					title: dbTrip.title ?? undefined,
					notes: dbTrip.notes ?? undefined,
					rating: dbTrip.rating ?? undefined,
					createdAt: dbTrip.createdAt,
					updatedAt: dbTrip.updatedAt,
					location: dbTrip.location
						? ({
								name: dbTrip.location.name ?? undefined,
								latitude: dbTrip.location.latitude,
								longitude: dbTrip.location.longitude,
								carDifficulty: dbTrip.location.carDifficulty ?? undefined,
								walkDifficulty: dbTrip.location.walkDifficulty ?? undefined,
								rating: dbTrip.location.rating ?? undefined,
							} as Location)
						: undefined,
				}));

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
	getTripsByDate: defineAction({
		accept: "json",
		input: getTripsByDateSchema,
		handler: createAuthorizedHandler(async (input, context, session) => {
			try {
				const dbTrips = await db.query.fishingTrips.findMany({
					where: and(
						eq(fishingTrips.userId, session.user.id),
						gte(fishingTrips.tripDate, input.startDate),
						lte(fishingTrips.tripDate, input.endDate)
					),
					with: {
						location: true,
					},
					limit: input.limit + 1, // Fetch one extra to check if there are more results
				});

				const hasMore = dbTrips.length > input.limit;
				const limitedTrips = hasMore ? dbTrips.slice(0, input.limit) : dbTrips;

				const trips = limitedTrips.reduce((acc, dbTrip) => {
					acc[dbTrip.tripDate] = {
						tripDate: dbTrip.tripDate,
						startTime: dbTrip.startTime ?? undefined,
						endTime: dbTrip.endTime ?? undefined,
						title: dbTrip.title ?? undefined,
						notes: dbTrip.notes ?? undefined,
						rating: dbTrip.rating ?? undefined,
						createdAt: dbTrip.createdAt,
						updatedAt: dbTrip.updatedAt,
						location: dbTrip.location
							? ({
									name: dbTrip.location.name ?? undefined,
									latitude: dbTrip.location.latitude,
									longitude: dbTrip.location.longitude,
									carDifficulty: dbTrip.location.carDifficulty ?? undefined,
									walkDifficulty: dbTrip.location.walkDifficulty ?? undefined,
									rating: dbTrip.location.rating ?? undefined,
								} as Location)
							: undefined,
					};
					return acc;
				}, {} as TripsByDate);

				return {
					success: true,
					message: hasMore
						? `Showing first ${input.limit} trips. Consider narrowing your date range for better performance.`
						: "Fishing trips retrieved successfully!",
					trips,
					hasMore,
					totalReturned: trips.length,
				};
			} catch (error) {
				if (error instanceof ActionError) {
					throw error;
				}

				console.error("Error retrieving trips by date:", error);
				throw new ActionError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Failed to retrieve fishing trips",
				});
			}
		}),
	}),
};
