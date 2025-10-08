import type { dailyWeather } from "src/db/schema";
import type { OpenMeteoResponse, WeatherData } from "./weather.model";
import type { InferInsertModel } from "drizzle-orm";

export async function fetchWeatherData(latitude: number, longitude: number, date: string): Promise<WeatherData> {
	const params = new URLSearchParams({
		latitude: latitude.toString(),
		longitude: longitude.toString(),
		start_date: date,
		end_date: date,
		daily: [
			"weather_code",
			"temperature_2m_max",
			"temperature_2m_min",
			"temperature_2m_mean",
			"apparent_temperature_max",
			"apparent_temperature_min",
			"apparent_temperature_mean",
			"wind_speed_10m_max",
			"wind_speed_10m_mean",
			"wind_speed_10m_min",
			"wind_gusts_10m_max",
			"wind_gusts_10m_mean",
			"wind_gusts_10m_min",
			"wind_direction_10m_dominant",
			"shortwave_radiation_sum",
			"et0_fao_evapotranspiration",
			"et0_fao_evapotranspiration_sum",
			"sunshine_duration",
			"daylight_duration",
			"uv_index_max",
			"uv_index_clear_sky_max",
			"precipitation_probability_max",
			"precipitation_probability_min",
			"precipitation_probability_mean",
			"precipitation_hours",
			"precipitation_sum",
			"showers_sum",
			"rain_sum",
			"snowfall_sum",
			"snowfall_water_equivalent_sum",
			"pressure_msl_min",
			"pressure_msl_max",
			"pressure_msl_mean",
			"surface_pressure_mean",
			"surface_pressure_min",
			"surface_pressure_max",
			"cloud_cover_mean",
			"cloud_cover_max",
			"cloud_cover_min",
			"relative_humidity_2m_mean",
			"relative_humidity_2m_min",
			"relative_humidity_2m_max",
			"dew_point_2m_mean",
			"dew_point_2m_min",
			"dew_point_2m_max",
			"wet_bulb_temperature_2m_max",
			"wet_bulb_temperature_2m_mean",
			"wet_bulb_temperature_2m_min",
			"vapour_pressure_deficit_max",
			"leaf_wetness_probability_mean",
			"cape_mean",
			"cape_max",
			"cape_min",
			"growing_degree_days_base_0_limit_50",
			"visibility_mean",
			"visibility_min",
			"visibility_max",
			"updraft_max",
			"sunrise",
			"sunset",
		].join(","),
		timezone: "auto",
	});

	const url = `https://api.open-meteo.com/v1/forecast?${params}`;
	const response = await fetch(url);

	if (!response.ok) {
		throw new Error(`Weather API request failed: ${response.statusText}`);
	}

	const data: OpenMeteoResponse = await response.json();
	const daily = data.daily;

	const weatherData: Omit<InferInsertModel<typeof dailyWeather>, "id"> = {
		date: daily.time[0],
		weatherCode: daily.weather_code[0],
		// Temperature
		temperatureMax: daily.temperature_2m_max[0],
		temperatureMin: daily.temperature_2m_min[0],
		temperatureMean: daily.temperature_2m_mean[0],
		apparentTemperatureMax: daily.apparent_temperature_max[0],
		apparentTemperatureMin: daily.apparent_temperature_min[0],
		apparentTemperatureMean: daily.apparent_temperature_mean[0],
		// Wind
		windSpeedMax: daily.wind_speed_10m_max[0],
		windSpeedMean: daily.wind_speed_10m_mean[0],
		windSpeedMin: daily.wind_speed_10m_min[0],
		windGustsMax: daily.wind_gusts_10m_max[0],
		windGustsMean: daily.wind_gusts_10m_mean[0],
		windGustsMin: daily.wind_gusts_10m_min[0],
		windDirectionDominant: daily.wind_direction_10m_dominant[0],
		// Solar radiation and sunshine
		shortwaveRadiationSum: daily.shortwave_radiation_sum[0],
		et0FaoEvapotranspiration: daily.et0_fao_evapotranspiration[0],
		et0FaoEvapotranspirationSum: daily.et0_fao_evapotranspiration_sum[0],
		sunshineDuration: daily.sunshine_duration[0],
		daylightDuration: daily.daylight_duration[0],
		// UV Index
		uvIndexMax: daily.uv_index_max[0],
		uvIndexClearSkyMax: daily.uv_index_clear_sky_max[0],
		// Precipitation
		precipitationProbabilityMax: daily.precipitation_probability_max[0],
		precipitationProbabilityMin: daily.precipitation_probability_min[0],
		precipitationProbabilityMean: daily.precipitation_probability_mean[0],
		precipitationHours: daily.precipitation_hours[0],
		precipitationSum: daily.precipitation_sum[0],
		showersSum: daily.showers_sum[0],
		rainSum: daily.rain_sum[0],
		snowfallSum: daily.snowfall_sum[0],
		snowfallWaterEquivalentSum: daily.snowfall_water_equivalent_sum[0],
		// Pressure
		pressureMslMin: daily.pressure_msl_min[0],
		pressureMslMax: daily.pressure_msl_max[0],
		pressureMslMean: daily.pressure_msl_mean[0],
		surfacePressureMean: daily.surface_pressure_mean[0],
		surfacePressureMin: daily.surface_pressure_min[0],
		surfacePressureMax: daily.surface_pressure_max[0],
		// Cloud cover
		cloudCoverMean: daily.cloud_cover_mean[0],
		cloudCoverMax: daily.cloud_cover_max[0],
		cloudCoverMin: daily.cloud_cover_min[0],
		// Humidity and dew point
		relativeHumidityMean: daily.relative_humidity_2m_mean[0],
		relativeHumidityMin: daily.relative_humidity_2m_min[0],
		relativeHumidityMax: daily.relative_humidity_2m_max[0],
		dewPointMean: daily.dew_point_2m_mean[0],
		dewPointMin: daily.dew_point_2m_min[0],
		dewPointMax: daily.dew_point_2m_max[0],
		// Wet bulb temperature
		wetBulbTemperatureMax: daily.wet_bulb_temperature_2m_max[0],
		wetBulbTemperatureMean: daily.wet_bulb_temperature_2m_mean[0],
		wetBulbTemperatureMin: daily.wet_bulb_temperature_2m_min[0],
		// Vapor pressure deficit
		vapourPressureDeficitMax: daily.vapour_pressure_deficit_max[0],
		// Leaf wetness
		leafWetnessProbabilityMean: daily.leaf_wetness_probability_mean[0],
		// CAPE
		capeMean: daily.cape_mean[0],
		capeMax: daily.cape_max[0],
		capeMin: daily.cape_min[0],
		// Growing degree days
		growingDegreeDaysBase0Limit50: daily.growing_degree_days_base_0_limit_50[0],
		// Visibility
		visibilityMean: daily.visibility_mean[0],
		visibilityMin: daily.visibility_min[0],
		visibilityMax: daily.visibility_max[0],
		// Updraft
		updraftMax: daily.updraft_max[0],
		// Timestamps
		sunrise: new Date(daily.sunrise[0]),
		sunset: new Date(daily.sunset[0]),
	};

	return weatherData;
}

export function shouldFetchWeatherBasedOnPosition(
	latitude: number,
	longitude: number,
	lastQueriedLatitude: number,
	lastQueriedLongitude: number
) {
	const latDiff = Math.abs(latitude - lastQueriedLatitude);
	const lonDiff = Math.abs(longitude - lastQueriedLongitude);

	// Only fetch if position changed by more than 0.05°
	return latDiff > 0.05 || lonDiff > 0.05;
}
