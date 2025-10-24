import { db } from "../index";
import { hourlyWeather } from "../schema";
import { sql, eq, and } from "drizzle-orm";
import type { InferInsertModel, InferSelectModel } from "drizzle-orm";

export type HourlyWeatherInsert = Omit<InferInsertModel<typeof hourlyWeather>, "id">;
export type HourlyWeatherSelect = InferSelectModel<typeof hourlyWeather>;

/**
 * Insert or update hourly weather data for a fishing trip
 * Uses onConflictDoUpdate to handle duplicate entries based on tripId and time
 */
export async function createOrUpdateHourlyWeather(data: HourlyWeatherInsert) {
	return await db
		.insert(hourlyWeather)
		.values({
			latitude: data.latitude,
			longitude: data.longitude,
			date: data.date,
			time: data.time,
			// Temperature
			temperature2m: data.temperature2m ?? undefined,
			apparentTemperature: data.apparentTemperature ?? undefined,
			temperature80m: data.temperature80m ?? undefined,
			temperature120m: data.temperature120m ?? undefined,
			temperature180m: data.temperature180m ?? undefined,
			// Weather condition
			weatherCode: data.weatherCode ?? undefined,
			// Pressure
			pressureMsl: data.pressureMsl ?? undefined,
			surfacePressure: data.surfacePressure ?? undefined,
			// Cloud cover
			cloudCover: data.cloudCover ?? undefined,
			cloudCoverLow: data.cloudCoverLow ?? undefined,
			cloudCoverMid: data.cloudCoverMid ?? undefined,
			cloudCoverHigh: data.cloudCoverHigh ?? undefined,
			// Visibility
			visibility: data.visibility ?? undefined,
			// Evapotranspiration
			evapotranspiration: data.evapotranspiration ?? undefined,
			et0FaoEvapotranspiration: data.et0FaoEvapotranspiration ?? undefined,
			// Humidity and dew point
			relativeHumidity2m: data.relativeHumidity2m ?? undefined,
			dewPoint2m: data.dewPoint2m ?? undefined,
			vapourPressureDeficit: data.vapourPressureDeficit ?? undefined,
			// Precipitation
			precipitationProbability: data.precipitationProbability ?? undefined,
			precipitation: data.precipitation ?? undefined,
			rain: data.rain ?? undefined,
			showers: data.showers ?? undefined,
			snowfall: data.snowfall ?? undefined,
			snowDepth: data.snowDepth ?? undefined,
			// Wind
			windSpeed10m: data.windSpeed10m ?? undefined,
			windSpeed80m: data.windSpeed80m ?? undefined,
			windSpeed120m: data.windSpeed120m ?? undefined,
			windSpeed180m: data.windSpeed180m ?? undefined,
			windDirection10m: data.windDirection10m ?? undefined,
			windDirection80m: data.windDirection80m ?? undefined,
			windDirection120m: data.windDirection120m ?? undefined,
			windDirection180m: data.windDirection180m ?? undefined,
			windGusts10m: data.windGusts10m ?? undefined,
			// Soil temperature
			soilTemperature0cm: data.soilTemperature0cm ?? undefined,
			soilTemperature6cm: data.soilTemperature6cm ?? undefined,
			soilTemperature18cm: data.soilTemperature18cm ?? undefined,
			soilTemperature54cm: data.soilTemperature54cm ?? undefined,
			// Soil moisture
			soilMoisture0To1cm: data.soilMoisture0To1cm ?? undefined,
			soilMoisture1To3cm: data.soilMoisture1To3cm ?? undefined,
			soilMoisture3To9cm: data.soilMoisture3To9cm ?? undefined,
			soilMoisture9To27cm: data.soilMoisture9To27cm ?? undefined,
			soilMoisture27To81cm: data.soilMoisture27To81cm ?? undefined,
		})
		.onConflictDoUpdate({
			target: [hourlyWeather.time],
			set: {
				latitude: data.latitude ?? sql`${hourlyWeather.latitude}`,
				longitude: data.longitude ?? sql`${hourlyWeather.longitude}`,
				date: data.date ?? sql`${hourlyWeather.date}`,
				// Temperature
				temperature2m: data.temperature2m ?? sql`${hourlyWeather.temperature2m}`,
				apparentTemperature: data.apparentTemperature ?? sql`${hourlyWeather.apparentTemperature}`,
				temperature80m: data.temperature80m ?? sql`${hourlyWeather.temperature80m}`,
				temperature120m: data.temperature120m ?? sql`${hourlyWeather.temperature120m}`,
				temperature180m: data.temperature180m ?? sql`${hourlyWeather.temperature180m}`,
				// Weather condition
				weatherCode: data.weatherCode ?? sql`${hourlyWeather.weatherCode}`,
				// Pressure
				pressureMsl: data.pressureMsl ?? sql`${hourlyWeather.pressureMsl}`,
				surfacePressure: data.surfacePressure ?? sql`${hourlyWeather.surfacePressure}`,
				// Cloud cover
				cloudCover: data.cloudCover ?? sql`${hourlyWeather.cloudCover}`,
				cloudCoverLow: data.cloudCoverLow ?? sql`${hourlyWeather.cloudCoverLow}`,
				cloudCoverMid: data.cloudCoverMid ?? sql`${hourlyWeather.cloudCoverMid}`,
				cloudCoverHigh: data.cloudCoverHigh ?? sql`${hourlyWeather.cloudCoverHigh}`,
				// Visibility
				visibility: data.visibility ?? sql`${hourlyWeather.visibility}`,
				// Evapotranspiration
				evapotranspiration: data.evapotranspiration ?? sql`${hourlyWeather.evapotranspiration}`,
				et0FaoEvapotranspiration:
					data.et0FaoEvapotranspiration ?? sql`${hourlyWeather.et0FaoEvapotranspiration}`,
				// Humidity and dew point
				relativeHumidity2m: data.relativeHumidity2m ?? sql`${hourlyWeather.relativeHumidity2m}`,
				dewPoint2m: data.dewPoint2m ?? sql`${hourlyWeather.dewPoint2m}`,
				vapourPressureDeficit: data.vapourPressureDeficit ?? sql`${hourlyWeather.vapourPressureDeficit}`,
				// Precipitation
				precipitationProbability:
					data.precipitationProbability ?? sql`${hourlyWeather.precipitationProbability}`,
				precipitation: data.precipitation ?? sql`${hourlyWeather.precipitation}`,
				rain: data.rain ?? sql`${hourlyWeather.rain}`,
				showers: data.showers ?? sql`${hourlyWeather.showers}`,
				snowfall: data.snowfall ?? sql`${hourlyWeather.snowfall}`,
				snowDepth: data.snowDepth ?? sql`${hourlyWeather.snowDepth}`,
				// Wind
				windSpeed10m: data.windSpeed10m ?? sql`${hourlyWeather.windSpeed10m}`,
				windSpeed80m: data.windSpeed80m ?? sql`${hourlyWeather.windSpeed80m}`,
				windSpeed120m: data.windSpeed120m ?? sql`${hourlyWeather.windSpeed120m}`,
				windSpeed180m: data.windSpeed180m ?? sql`${hourlyWeather.windSpeed180m}`,
				windDirection10m: data.windDirection10m ?? sql`${hourlyWeather.windDirection10m}`,
				windDirection80m: data.windDirection80m ?? sql`${hourlyWeather.windDirection80m}`,
				windDirection120m: data.windDirection120m ?? sql`${hourlyWeather.windDirection120m}`,
				windDirection180m: data.windDirection180m ?? sql`${hourlyWeather.windDirection180m}`,
				windGusts10m: data.windGusts10m ?? sql`${hourlyWeather.windGusts10m}`,
				// Soil temperature
				soilTemperature0cm: data.soilTemperature0cm ?? sql`${hourlyWeather.soilTemperature0cm}`,
				soilTemperature6cm: data.soilTemperature6cm ?? sql`${hourlyWeather.soilTemperature6cm}`,
				soilTemperature18cm: data.soilTemperature18cm ?? sql`${hourlyWeather.soilTemperature18cm}`,
				soilTemperature54cm: data.soilTemperature54cm ?? sql`${hourlyWeather.soilTemperature54cm}`,
				// Soil moisture
				soilMoisture0To1cm: data.soilMoisture0To1cm ?? sql`${hourlyWeather.soilMoisture0To1cm}`,
				soilMoisture1To3cm: data.soilMoisture1To3cm ?? sql`${hourlyWeather.soilMoisture1To3cm}`,
				soilMoisture3To9cm: data.soilMoisture3To9cm ?? sql`${hourlyWeather.soilMoisture3To9cm}`,
				soilMoisture9To27cm: data.soilMoisture9To27cm ?? sql`${hourlyWeather.soilMoisture9To27cm}`,
				soilMoisture27To81cm: data.soilMoisture27To81cm ?? sql`${hourlyWeather.soilMoisture27To81cm}`,
				fetchedAt: sql`(unixepoch())`,
			},
		})
		.returning();
}

/**
 * Get hourly weather data by date and location
 * @param date - Date in YYYY-MM-DD format
 * @param latitude - Location latitude
 * @param longitude - Location longitude
 * @returns Array of hourly weather records for the specified date and location, ordered by time
 */
export async function getHourlyWeatherByDate(
	date: string,
	latitude: number,
	longitude: number
): Promise<HourlyWeatherSelect[]> {
	return await db
		.select()
		.from(hourlyWeather)
		.where(
			and(
				eq(hourlyWeather.date, date),
				eq(hourlyWeather.latitude, latitude),
				eq(hourlyWeather.longitude, longitude)
			)
		)
		.orderBy(hourlyWeather.time);
}
