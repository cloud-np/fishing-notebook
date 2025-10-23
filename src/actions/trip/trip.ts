import { ActionError, defineAction } from "astro:actions";
import { createTripSchema, getTripsByDateSchema } from "./trip.validation";
import { db } from "@db/index";
import { fishingTrips } from "@db/schema";
import { createAuthorizedHandler } from "src/actions/auth";
import { eq, and, gte, lte } from "drizzle-orm";
import { createOrUpdateLocation } from "@db/locations/locations";
import type { Trip, TripsByDate } from "src/types/Trip.model";
import type { Location } from "src/types/Location.model";
import { createOrUpdateHourlyWeather } from "@db/weather/hourlyWeather";
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

				const weatherResponse = await getWeatherService().getHourlyWeather(
					location.latitude,
					location.longitude,
					input.tripDate
				);

				// Save each hour's weather data
				const hourlyData = weatherResponse.hourly;
				const promises = hourlyData.time.map((time, index) => {
					return createOrUpdateHourlyWeather({
						latitude: weatherResponse.latitude,
						longitude: weatherResponse.longitude,
						date: input.tripDate,
						time: time,
						// Temperature
						temperature2m: hourlyData.temperature_2m[index],
						apparentTemperature: hourlyData.apparent_temperature[index],
						temperature80m: hourlyData.temperature_80m[index],
						temperature120m: hourlyData.temperature_120m[index],
						temperature180m: hourlyData.temperature_180m[index],
						// Weather condition
						weatherCode: hourlyData.weather_code[index],
						// Pressure
						pressureMsl: hourlyData.pressure_msl[index],
						surfacePressure: hourlyData.surface_pressure[index],
						// Cloud cover
						cloudCover: hourlyData.cloud_cover[index],
						cloudCoverLow: hourlyData.cloud_cover_low[index],
						cloudCoverMid: hourlyData.cloud_cover_mid[index],
						cloudCoverHigh: hourlyData.cloud_cover_high[index],
						// Visibility
						visibility: hourlyData.visibility[index],
						// Evapotranspiration
						evapotranspiration: hourlyData.evapotranspiration[index],
						et0FaoEvapotranspiration: hourlyData.et0_fao_evapotranspiration[index],
						// Humidity and dew point
						relativeHumidity2m: hourlyData.relative_humidity_2m[index],
						dewPoint2m: hourlyData.dew_point_2m[index],
						vapourPressureDeficit: hourlyData.vapour_pressure_deficit[index],
						// Precipitation
						precipitationProbability: hourlyData.precipitation_probability[index],
						precipitation: hourlyData.precipitation[index],
						rain: hourlyData.rain[index],
						showers: hourlyData.showers[index],
						snowfall: hourlyData.snowfall[index],
						snowDepth: hourlyData.snow_depth[index],
						// Wind
						windSpeed10m: hourlyData.wind_speed_10m[index],
						windSpeed80m: hourlyData.wind_speed_80m[index],
						windSpeed120m: hourlyData.wind_speed_120m[index],
						windSpeed180m: hourlyData.wind_speed_180m[index],
						windDirection10m: hourlyData.wind_direction_10m[index],
						windDirection80m: hourlyData.wind_direction_80m[index],
						windDirection120m: hourlyData.wind_direction_120m[index],
						windDirection180m: hourlyData.wind_direction_180m[index],
						windGusts10m: hourlyData.wind_gusts_10m[index],
						// Soil temperature
						soilTemperature0cm: hourlyData.soil_temperature_0cm[index],
						soilTemperature6cm: hourlyData.soil_temperature_6cm[index],
						soilTemperature18cm: hourlyData.soil_temperature_18cm[index],
						soilTemperature54cm: hourlyData.soil_temperature_54cm[index],
						// Soil moisture
						soilMoisture0To1cm: hourlyData.soil_moisture_0_to_1cm[index],
						soilMoisture1To3cm: hourlyData.soil_moisture_1_to_3cm[index],
						soilMoisture3To9cm: hourlyData.soil_moisture_3_to_9cm[index],
						soilMoisture9To27cm: hourlyData.soil_moisture_9_to_27cm[index],
						soilMoisture27To81cm: hourlyData.soil_moisture_27_to_81cm[index],
					});
				});

				// Wait for all hourly weather records to be saved
				await Promise.all(promises);

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
