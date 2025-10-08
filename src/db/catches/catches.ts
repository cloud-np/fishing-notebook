import { db } from "../index";
import { catches, fishSpecies } from "../schema";
import { eq, and, desc, sum, count, sql, type InferInsertModel } from "drizzle-orm";

/**
 * Insert a new catch
 */
export async function insertCatch(catchData: InferInsertModel<typeof catches>) {
	return await db.insert(catches).values(catchData);
}

/**
 * Get a catch by ID
 */
export async function getCatchById(catchId: number) {
	const result = await db.select().from(catches).where(eq(catches.id, catchId));
	return result[0];
}

/**
 * Get all catches for a trip
 */
export async function getCatchesByTripId(tripId: number) {
	return await db
		.select({
			catch: catches,
			species: fishSpecies,
		})
		.from(catches)
		.leftJoin(fishSpecies, eq(catches.speciesId, fishSpecies.id))
		.where(eq(catches.tripId, tripId))
		.orderBy(desc(catches.timeCaught));
}

/**
 * Get catch statistics for a trip
 */
export async function getTripCatchStats(tripId: number) {
	const result = await db
		.select({
			totalCatches: count(),
			totalWeight: sum(catches.weight),
			totalQuantity: sum(catches.quantity),
		})
		.from(catches)
		.where(eq(catches.tripId, tripId));

	return result[0];
}

/**
 * Update a catch
 */
export async function updateCatch(catchId: number, data: Partial<InferInsertModel<typeof catches>>) {
	return await db.update(catches).set(data).where(eq(catches.id, catchId));
}

/**
 * Delete a catch
 */
export async function deleteCatch(catchId: number) {
	return await db.delete(catches).where(eq(catches.id, catchId));
}

/**
 * Get catches by species
 */
export async function getCatchesBySpecies(speciesId: number) {
	return await db.select().from(catches).where(eq(catches.speciesId, speciesId));
}

// Fish Species utilities

/**
 * Insert a new fish species
 */
export async function insertFishSpecies(species: InferInsertModel<typeof fishSpecies>) {
	return await db.insert(fishSpecies).values(species);
}

/**
 * Get all fish species
 */
export async function getAllFishSpecies() {
	return await db.select().from(fishSpecies);
}

/**
 * Get fish species by category
 */
export async function getFishSpeciesByCategory(category: "freshwater" | "saltwater" | "both") {
	return await db.select().from(fishSpecies).where(eq(fishSpecies.category, category));
}

/**
 * Search fish species by name
 */
export async function searchFishSpecies(searchTerm: string) {
	return await db
		.select()
		.from(fishSpecies)
		.where(
			sql`${fishSpecies.commonName} LIKE ${`%${searchTerm}%`} OR ${fishSpecies.scientificName} LIKE ${`%${searchTerm}%`}`
		);
}
