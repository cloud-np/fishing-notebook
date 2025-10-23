import { dailyWeather as dailyWeatherType } from "src/db/schema";
import type { InferInsertModel } from "drizzle-orm";
import { getDataFromDbByArgs } from "@db/index";

export type DailyWeather = InferInsertModel<typeof dailyWeatherType>;
export type FetchedDailyWeather = Omit<DailyWeather, "id" | "fetchedAt">;
export type Position = {
	latitude: number;
	longitude: number;
};

export interface OpenMeteoBaseResponse {
	latitude: number;
	longitude: number;
	timezone: string;
	timezone_abbreviation: string;
	utc_offset_seconds: number;
}

export interface OpenMeteoDailyWeatherResponse extends OpenMeteoBaseResponse {
	daily: {
		time: string[];
		weather_code: number[];
		temperature_2m_max: number[];
		temperature_2m_min: number[];
		temperature_2m_mean: number[];
		apparent_temperature_max: number[];
		apparent_temperature_min: number[];
		apparent_temperature_mean: number[];
		wind_speed_10m_max: number[];
		wind_speed_10m_mean: number[];
		wind_speed_10m_min: number[];
		wind_gusts_10m_max: number[];
		wind_gusts_10m_mean: number[];
		wind_gusts_10m_min: number[];
		wind_direction_10m_dominant: number[];
		shortwave_radiation_sum: number[];
		et0_fao_evapotranspiration: number[];
		et0_fao_evapotranspiration_sum: number[];
		sunshine_duration: number[];
		daylight_duration: number[];
		uv_index_max: number[];
		uv_index_clear_sky_max: number[];
		precipitation_probability_max: number[];
		precipitation_probability_min: number[];
		precipitation_probability_mean: number[];
		precipitation_hours: number[];
		precipitation_sum: number[];
		showers_sum: number[];
		rain_sum: number[];
		snowfall_sum: number[];
		snowfall_water_equivalent_sum: number[];
		pressure_msl_min: number[];
		pressure_msl_max: number[];
		pressure_msl_mean: number[];
		surface_pressure_mean: number[];
		surface_pressure_min: number[];
		surface_pressure_max: number[];
		cloud_cover_mean: number[];
		cloud_cover_max: number[];
		cloud_cover_min: number[];
		relative_humidity_2m_mean: number[];
		relative_humidity_2m_min: number[];
		relative_humidity_2m_max: number[];
		dew_point_2m_mean: number[];
		dew_point_2m_min: number[];
		dew_point_2m_max: number[];
		wet_bulb_temperature_2m_max: number[];
		wet_bulb_temperature_2m_mean: number[];
		wet_bulb_temperature_2m_min: number[];
		vapour_pressure_deficit_max: number[];
		leaf_wetness_probability_mean: number[];
		cape_mean: number[];
		cape_max: number[];
		cape_min: number[];
		growing_degree_days_base_0_limit_50: number[];
		visibility_mean: number[];
		visibility_min: number[];
		visibility_max: number[];
		updraft_max: number[];
		sunrise: string[];
		sunset: string[];
	};
}

export interface OpenMeteoHourlyWeatherResponse extends OpenMeteoBaseResponse {
	generationtime_ms: number;
	elevation: number;
	hourly_units: {
		time: string;
		temperature_2m: string;
		weather_code: string;
		pressure_msl: string;
		surface_pressure: string;
		cloud_cover: string;
		cloud_cover_low: string;
		cloud_cover_mid: string;
		cloud_cover_high: string;
		visibility: string;
		evapotranspiration: string;
		et0_fao_evapotranspiration: string;
		relative_humidity_2m: string;
		dew_point_2m: string;
		apparent_temperature: string;
		precipitation_probability: string;
		precipitation: string;
		rain: string;
		showers: string;
		snowfall: string;
		snow_depth: string;
		vapour_pressure_deficit: string;
		temperature_120m: string;
		temperature_180m: string;
		temperature_80m: string;
		wind_gusts_10m: string;
		wind_direction_180m: string;
		wind_direction_120m: string;
		wind_direction_80m: string;
		wind_direction_10m: string;
		wind_speed_180m: string;
		wind_speed_120m: string;
		wind_speed_80m: string;
		wind_speed_10m: string;
		soil_temperature_0cm: string;
		soil_temperature_6cm: string;
		soil_temperature_18cm: string;
		soil_temperature_54cm: string;
		soil_moisture_0_to_1cm: string;
		soil_moisture_1_to_3cm: string;
		soil_moisture_3_to_9cm: string;
		soil_moisture_9_to_27cm: string;
		soil_moisture_27_to_81cm: string;
	};
	hourly: {
		time: string[];
		temperature_2m: number[];
		weather_code: number[];
		pressure_msl: number[];
		surface_pressure: number[];
		cloud_cover: number[];
		cloud_cover_low: number[];
		cloud_cover_mid: number[];
		cloud_cover_high: number[];
		visibility: number[];
		evapotranspiration: number[];
		et0_fao_evapotranspiration: number[];
		relative_humidity_2m: number[];
		dew_point_2m: number[];
		apparent_temperature: number[];
		precipitation_probability: number[];
		precipitation: number[];
		rain: number[];
		showers: number[];
		snowfall: number[];
		snow_depth: number[];
		vapour_pressure_deficit: number[];
		temperature_120m: number[];
		temperature_180m: number[];
		temperature_80m: number[];
		wind_gusts_10m: number[];
		wind_direction_180m: number[];
		wind_direction_120m: number[];
		wind_direction_80m: number[];
		wind_direction_10m: number[];
		wind_speed_180m: number[];
		wind_speed_120m: number[];
		wind_speed_80m: number[];
		wind_speed_10m: number[];
		soil_temperature_0cm: number[];
		soil_temperature_6cm: number[];
		soil_temperature_18cm: number[];
		soil_temperature_54cm: number[];
		soil_moisture_0_to_1cm: number[];
		soil_moisture_1_to_3cm: number[];
		soil_moisture_3_to_9cm: number[];
		soil_moisture_9_to_27cm: number[];
		soil_moisture_27_to_81cm: number[];
	};
}

export class WeatherService {
	lastDailyWeather?: FetchedDailyWeather = undefined;

	async fetchDailyWeather(latitude: number, longitude: number, date: string): Promise<FetchedDailyWeather> {
		// If the user requested the same location as the last time, return the cached data
		if (
			this.lastDailyWeather &&
			isPositionEqual(this.lastDailyWeather.latitude, this.lastDailyWeather.longitude, latitude, longitude)
		) {
			return this.lastDailyWeather;
		}

		// Maybe we can abstract this away, not even sure if this is ok
		// but at least we don't hit the endpoint more than once
		const dbData = await getDataFromDbByArgs("dailyWeather", { latitude, longitude, date });
		if (dbData) {
			return dbData as FetchedDailyWeather;
		}

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

		const data: OpenMeteoDailyWeatherResponse = await response.json();
		const daily = data.daily;

		const dailyWeatherData: FetchedDailyWeather = {
			latitude,
			longitude,
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
			sunrise: daily.sunrise[0],
			sunset: daily.sunset[0],
		};

		this.lastDailyWeather = dailyWeatherData;
		return dailyWeatherData;
	}

	async getHourlyWeather(latitude: number, longitude: number, date: string): Promise<OpenMeteoHourlyWeatherResponse> {
		const params = new URLSearchParams({
			latitude: latitude.toString(),
			longitude: longitude.toString(),
			start_date: date,
			end_date: date,
			hourly: [
				"temperature_2m",
				"weather_code",
				"pressure_msl",
				"surface_pressure",
				"cloud_cover",
				"cloud_cover_low",
				"cloud_cover_mid",
				"cloud_cover_high",
				"visibility",
				"evapotranspiration",
				"et0_fao_evapotranspiration",
				"relative_humidity_2m",
				"dew_point_2m",
				"apparent_temperature",
				"precipitation_probability",
				"precipitation",
				"rain",
				"showers",
				"snowfall",
				"snow_depth",
				"vapour_pressure_deficit",
				"temperature_120m",
				"temperature_180m",
				"temperature_80m",
				"wind_gusts_10m",
				"wind_direction_180m",
				"wind_direction_120m",
				"wind_direction_80m",
				"wind_direction_10m",
				"wind_speed_180m",
				"wind_speed_120m",
				"wind_speed_80m",
				"wind_speed_10m",
				"soil_temperature_0cm",
				"soil_temperature_6cm",
				"soil_temperature_18cm",
				"soil_temperature_54cm",
				"soil_moisture_0_to_1cm",
				"soil_moisture_1_to_3cm",
				"soil_moisture_3_to_9cm",
				"soil_moisture_9_to_27cm",
				"soil_moisture_27_to_81cm",
			].join(","),
			timezone: "auto",
		});

		const url = `https://api.open-meteo.com/v1/forecast?${params}`;

		const response = await fetch(url);

		if (!response.ok) {
			throw new Error(`Weather API request failed: ${response.statusText}`);
		}

		const data = await response.json();
		return data;
	}
}

function isPositionEqual(
	latitude: number,
	longitude: number,
	lastQueriedLatitude: number,
	lastQueriedLongitude: number
): boolean {
	const latDiff = Math.abs(latitude - lastQueriedLatitude);
	const lonDiff = Math.abs(longitude - lastQueriedLongitude);

	// Only fetch if position changed by more than 0.05°
	return latDiff <= 0.05 && lonDiff <= 0.05;
}
