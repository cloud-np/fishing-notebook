import { db } from "../index";
import { locations } from "../schema";
import { eq, and, sql, type InferInsertModel } from "drizzle-orm";

/**
 * Insert a new location
 */
export async function insertLocation(location: InferInsertModel<typeof locations>) {
	return await db.insert(locations).values(location);
}

/**
 * Get a location by ID
 */
export async function getLocationById(locationId: number) {
	const result = await db.select().from(locations).where(eq(locations.id, locationId));
	return result[0];
}

/**
 * Get all locations for a user
 */
export async function getLocationsByUserId(userId: string) {
	return await db
		.select()
		.from(locations)
		.where(eq(locations.userId, userId as any));
}

/**
 * Get locations within a radius (in kilometers)
 */
export async function getLocationsNearby(latitude: number, longitude: number, radiusKm: number, userId?: string) {
	// Haversine formula for distance calculation
	// This is approximate but works well for small distances
	const query = db
		.select({
			location: locations,
			distance: sql<number>`(
				6371 * acos(
					cos(radians(${latitude})) *
					cos(radians(${locations.latitude})) *
					cos(radians(${locations.longitude}) - radians(${longitude})) +
					sin(radians(${latitude})) *
					sin(radians(${locations.latitude}))
				)
			)`,
		})
		.from(locations);

	if (userId) {
		return await query.where(eq(locations.userId, userId as any));
	}

	return await query;
}

/**
 * Update a location
 */
export async function updateLocation(locationId: number, data: Partial<InferInsertModel<typeof locations>>) {
	return await db.update(locations).set(data).where(eq(locations.id, locationId));
}

/**
 * Delete a location
 */
export async function deleteLocation(locationId: number) {
	return await db.delete(locations).where(eq(locations.id, locationId));
}

/**
 * Search locations by name
 */
export async function searchLocationsByName(userId: string, searchTerm: string) {
	return await db
		.select()
		.from(locations)
		.where(and(eq(locations.userId, userId as any), sql`${locations.name} LIKE ${`%${searchTerm}%`}`));
}
