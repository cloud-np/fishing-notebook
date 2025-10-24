import { ActionError, defineAction } from "astro:actions";
import { getWeatherByDateSchema } from "./weather.validation";
import { createAuthorizedHandler } from "src/actions/auth";
import { getWeatherService } from "@libs/services";
import type { HourlyWeatherSelect } from "@db/weather/hourlyWeather";

export const weather = {
	getByDate: defineAction({
		accept: "json",
		input: getWeatherByDateSchema,
		handler: createAuthorizedHandler(async input => {
			try {
				const weatherData = await getWeatherService().fetchHourlyWeather(
					input.date,
					input.latitude,
					input.longitude
				);

				// TODO: 'hour' here shouldn't be any fix it.
				// Map hourly weather data to a more user-friendly format
				const mappedData = weatherData.map(hour => ({
					time: hour[0].time,
					// Temperature
					temperature: hour[0].temperature2m,
					feelsLike: hour[0].apparentTemperature,
					temperature80m: hour[0].temperature80m,
					temperature120m: hour[0].temperature120m,
					temperature180m: hour[0].temperature180m,
					// Weather condition
					weatherCode: hour[0].weatherCode,
					// Pressure
					pressure: hour[0].pressureMsl,
					surfacePressure: hour[0].surfacePressure,
					// Cloud cover
					cloudCover: hour[0].cloudCover,
					cloudCoverLow: hour[0].cloudCoverLow,
					cloudCoverMid: hour[0].cloudCoverMid,
					cloudCoverHigh: hour[0].cloudCoverHigh,
					// Visibility
					visibility: hour[0].visibility,
					// Evapotranspiration
					evapotranspiration: hour[0].evapotranspiration,
					et0FaoEvapotranspiration: hour[0].et0FaoEvapotranspiration,
					// Humidity and dew point
					humidity: hour[0].relativeHumidity2m,
					dewPoint: hour[0].dewPoint2m,
					vapourPressureDeficit: hour[0].vapourPressureDeficit,
					// Precipitation
					precipitationProbability: hour[0].precipitationProbability,
					precipitation: hour[0].precipitation,
					rain: hour[0].rain,
					showers: hour[0].showers,
					snowfall: hour[0].snowfall,
					snowDepth: hour[0].snowDepth,
					// Wind
					windSpeed: hour[0].windSpeed10m,
					windSpeed80m: hour[0].windSpeed80m,
					windSpeed120m: hour[0].windSpeed120m,
					windSpeed180m: hour[0].windSpeed180m,
					windDirection: hour[0].windDirection10m,
					windDirection80m: hour[0].windDirection80m,
					windDirection120m: hour[0].windDirection120m,
					windDirection180m: hour[0].windDirection180m,
					windGusts: hour[0].windGusts10m,
					// Soil temperature
					soilTemp0cm: hour[0].soilTemperature0cm,
					soilTemp6cm: hour[0].soilTemperature6cm,
					soilTemp18cm: hour[0].soilTemperature18cm,
					soilTemp54cm: hour[0].soilTemperature54cm,
					// Soil moisture
					soilMoisture0To1cm: hour[0].soilMoisture0To1cm,
					soilMoisture1To3cm: hour[0].soilMoisture1To3cm,
					soilMoisture3To9cm: hour[0].soilMoisture3To9cm,
					soilMoisture9To27cm: hour[0].soilMoisture9To27cm,
					soilMoisture27To81cm: hour[0].soilMoisture27To81cm,
				}));

				return {
					success: true,
					message: "Weather data retrieved successfully!",
					data: mappedData,
				};
			} catch (error) {
				if (error instanceof ActionError) {
					throw error;
				}

				console.error("Error retrieving weather data:", error);
				throw new ActionError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Failed to retrieve weather data",
				});
			}
		}),
	}),
};
