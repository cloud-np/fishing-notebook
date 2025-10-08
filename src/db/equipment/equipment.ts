import { db } from "../index";
import { equipment, tripEquipment, fishingTrips } from "../schema";
import { eq, and, type InferInsertModel } from "drizzle-orm";

/**
 * Insert new equipment
 */
export async function insertEquipment(equipmentData: InferInsertModel<typeof equipment>) {
	return await db.insert(equipment).values(equipmentData);
}

/**
 * Get equipment by ID
 */
export async function getEquipmentById(equipmentId: number) {
	const result = await db.select().from(equipment).where(eq(equipment.id, equipmentId));
	return result[0];
}

/**
 * Get all equipment for a user
 */
export async function getEquipmentByUserId(userId: string) {
	return await db
		.select()
		.from(equipment)
		.where(eq(equipment.userId, userId as any));
}

/**
 * Get equipment by type
 */
export async function getEquipmentByType(userId: string, type: "rod" | "reel" | "line" | "lure" | "bait" | "other") {
	return await db
		.select()
		.from(equipment)
		.where(and(eq(equipment.userId, userId as any), eq(equipment.type, type)));
}

/**
 * Update equipment
 */
export async function updateEquipment(equipmentId: number, data: Partial<InferInsertModel<typeof equipment>>) {
	return await db.update(equipment).set(data).where(eq(equipment.id, equipmentId));
}

/**
 * Delete equipment
 */
export async function deleteEquipment(equipmentId: number) {
	return await db.delete(equipment).where(eq(equipment.id, equipmentId));
}

// Trip Equipment Junction

/**
 * Link equipment to a trip
 */
export async function addEquipmentToTrip(tripId: number, equipmentId: number) {
	return await db.insert(tripEquipment).values({
		tripId,
		equipmentId,
	});
}

/**
 * Remove equipment from a trip
 */
export async function removeEquipmentFromTrip(tripId: number, equipmentId: number) {
	return await db
		.delete(tripEquipment)
		.where(and(eq(tripEquipment.tripId, tripId), eq(tripEquipment.equipmentId, equipmentId)));
}

/**
 * Get all equipment used in a trip
 */
export async function getEquipmentForTrip(tripId: number) {
	return await db
		.select({
			equipment: equipment,
		})
		.from(tripEquipment)
		.innerJoin(equipment, eq(tripEquipment.equipmentId, equipment.id))
		.where(eq(tripEquipment.tripId, tripId));
}

/**
 * Get all trips that used specific equipment
 */
export async function getTripsForEquipment(equipmentId: number) {
	return await db
		.select({
			trip: fishingTrips,
		})
		.from(tripEquipment)
		.innerJoin(fishingTrips, eq(tripEquipment.tripId, fishingTrips.id))
		.where(eq(tripEquipment.equipmentId, equipmentId));
}
