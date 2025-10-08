import { db } from "../index";
import { fishingTrips, locations, dailyWeather } from "../schema";
import { eq, and, desc, gte, lte, type InferInsertModel } from "drizzle-orm";

/**
 * Insert a new fishing trip
 */
export async function insertFishingTrip(trip: InferInsertModel<typeof fishingTrips>) {
	return await db.insert(fishingTrips).values(trip);
}

/**
 * Get a fishing trip by ID
 */
export async function getTripById(tripId: number) {
	const result = await db.select().from(fishingTrips).where(eq(fishingTrips.id, tripId));
	return result[0];
}

/**
 * Get fishing trip with weather and location data
 */
export async function getTripWithWeather(tripId: number) {
	const result = await db
		.select({
			trip: fishingTrips,
			weather: dailyWeather,
			locationName: locations.name,
			locationLatitude: locations.latitude,
			locationLongitude: locations.longitude,
		})
		.from(fishingTrips)
		.leftJoin(dailyWeather, eq(fishingTrips.id, dailyWeather.tripId))
		.leftJoin(locations, eq(fishingTrips.locationId, locations.id))
		.where(eq(fishingTrips.id, tripId));

	return result[0];
}

/**
 * Get all trips for a user
 */
export async function getTripsByUserId(userId: string, limit?: number) {
	let query = db
		.select()
		.from(fishingTrips)
		.where(eq(fishingTrips.userId, userId as any))
		.orderBy(desc(fishingTrips.tripDate));

	if (limit) {
		query = query.limit(limit) as any;
	}

	return await query;
}

/**
 * Get trips by date range
 */
export async function getTripsByDateRange(userId: string, startDate: string, endDate: string) {
	return await db
		.select()
		.from(fishingTrips)
		.where(
			and(
				eq(fishingTrips.userId, userId as any),
				gte(fishingTrips.tripDate, startDate),
				lte(fishingTrips.tripDate, endDate)
			)
		)
		.orderBy(desc(fishingTrips.tripDate));
}

/**
 * Update a fishing trip
 */
export async function updateFishingTrip(tripId: number, data: Partial<InferInsertModel<typeof fishingTrips>>) {
	return await db.update(fishingTrips).set(data).where(eq(fishingTrips.id, tripId));
}

/**
 * Delete a fishing trip
 */
export async function deleteFishingTrip(tripId: number) {
	return await db.delete(fishingTrips).where(eq(fishingTrips.id, tripId));
}

/**
 * Get trip count for a user
 */
export async function getTripCount(userId: string): Promise<number> {
	const result = await db
		.select()
		.from(fishingTrips)
		.where(eq(fishingTrips.userId, userId as any));
	return result.length;
}
