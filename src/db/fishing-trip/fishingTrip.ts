import { db } from "../index";
import { fishingTrips, locations, dailyWeather } from "../schema";
import { eq, and, desc, gte, lte, sql, type InferInsertModel } from "drizzle-orm";

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

/**
 * Create or update a fishing trip
 * If tripId is provided, updates that specific trip (allowing date changes)
 * Otherwise, uses userId + tripDate as the unique constraint for upsert
 */
export async function createOrUpdateTrip(trip: {
	tripId?: number;
	userId: string;
	locationId: number;
	tripDate: string;
	startTime?: string;
	endTime?: string;
	title?: string;
	notes?: string;
	rating?: number;
}) {
	// If tripId is provided, update by ID (allows date changes)
	if (trip.tripId) {
		return await db
			.update(fishingTrips)
			.set({
				locationId: trip.locationId,
				tripDate: trip.tripDate,
				startTime: trip.startTime ?? undefined,
				endTime: trip.endTime ?? undefined,
				title: trip.title ?? undefined,
				notes: trip.notes ?? undefined,
				rating: trip.rating ?? undefined,
				updatedAt: sql`(unixepoch())`,
			})
			.where(and(eq(fishingTrips.id, trip.tripId), eq(fishingTrips.userId, trip.userId as any)))
			.returning();
	}

	// Otherwise, insert a new trip
	return await db
		.insert(fishingTrips)
		.values({
			userId: trip.userId as any,
			locationId: trip.locationId,
			tripDate: trip.tripDate,
			startTime: trip.startTime ?? undefined,
			endTime: trip.endTime ?? undefined,
			title: trip.title ?? undefined,
			notes: trip.notes ?? undefined,
			rating: trip.rating ?? undefined,
		})
		.onConflictDoUpdate({
			target: [fishingTrips.userId, fishingTrips.tripDate],
			set: {
				locationId: trip.locationId,
				startTime: trip.startTime ?? undefined,
				endTime: trip.endTime ?? undefined,
				title: trip.title ?? undefined,
				notes: trip.notes ?? undefined,
				rating: trip.rating ?? undefined,
				updatedAt: sql`(unixepoch())`,
			},
		})
		.returning();
}
