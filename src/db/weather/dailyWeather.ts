import { db } from "../index";
import { dailyWeather } from "../schema";
import { eq } from "drizzle-orm";
import type { InferInsertModel } from "drizzle-orm";

/**
 * Insert weather data for a fishing trip
 */
export async function insertdailyWeather(data: InferInsertModel<typeof dailyWeather>) {
	return await db.insert(dailyWeather).values(data);
}

/**
 * Get weather data by trip ID
 */
export async function getWeatherByTripId(tripId: number) {
	const result = await db.select().from(dailyWeather).where(eq(dailyWeather.tripId, tripId));
	return result[0];
}

/**
 * Update weather data for a trip
 */
export async function updatedailyWeather(tripId: number, data: Partial<InferInsertModel<typeof dailyWeather>>) {
	return await db.update(dailyWeather).set(data).where(eq(dailyWeather.tripId, tripId));
}

/**
 * Delete weather data for a trip
 */
export async function deletedailyWeather(tripId: number) {
	return await db.delete(dailyWeather).where(eq(dailyWeather.tripId, tripId));
}

/**
 * Check if weather data exists for a trip
 */
export async function hasdailyWeather(tripId: number): Promise<boolean> {
	const result = await db.select().from(dailyWeather).where(eq(dailyWeather.tripId, tripId));
	return result.length > 0;
}
