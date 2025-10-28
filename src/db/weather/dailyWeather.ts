import { db } from "../index";
import { dailyWeather } from "../schema";
import type { InferInsertModel } from "drizzle-orm";

/**
 * Insert weather data for a fishing trip
 */
export async function insertdailyWeather(data: InferInsertModel<typeof dailyWeather>) {
	return await db.insert(dailyWeather).values(data);
}
