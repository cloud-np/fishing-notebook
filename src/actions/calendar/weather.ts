export interface WeatherData {
	date: Date;
	weatherCode: number;
	temperatureMax: number;
	temperatureMin: number;
	temperatureMean: number;
	apparentTemperatureMax: number;
	apparentTemperatureMin: number;
	precipitationSum: number;
	precipitationHours: number;
	rainSum: number;
	pressureMslMean: number;
	windSpeedMax: number;
	windGustsMax: number;
	windDirectionDominant: number;
	cloudCoverMean: number;
	relativeHumidityMean: number;
	shortwaveRadiationSum: number;
	et0FaoEvapotranspiration: number;
	sunshineDuration: number;
	daylightDuration: number;
	uvIndexMax: number;
	sunrise: Date;
	sunset: Date;
}

interface OpenMeteoResponse {
	latitude: number;
	longitude: number;
	timezone: string;
	timezone_abbreviation: string;
	utc_offset_seconds: number;
	daily: {
		time: string[];
		weather_code: number[];
		temperature_2m_max: number[];
		temperature_2m_min: number[];
		temperature_2m_mean: number[];
		apparent_temperature_max: number[];
		apparent_temperature_min: number[];
		precipitation_sum: number[];
		precipitation_hours: number[];
		rain_sum: number[];
		pressure_msl_mean: number[];
		wind_speed_10m_max: number[];
		wind_gusts_10m_max: number[];
		wind_direction_10m_dominant: number[];
		cloud_cover_mean: number[];
		relative_humidity_2m_mean: number[];
		shortwave_radiation_sum: number[];
		et0_fao_evapotranspiration: number[];
		sunshine_duration: number[];
		daylight_duration: number[];
		uv_index_max: number[];
		sunrise: string[];
		sunset: string[];
	};
}

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
			"precipitation_sum",
			"precipitation_hours",
			"rain_sum",
			"pressure_msl_mean",
			"wind_speed_10m_max",
			// We need to add these to the hourly fetch.
			// "wind_speed_10m", // new
			// "wind_direction_10m", // new
			"wind_gusts_10m_max",
			"wind_direction_10m_dominant",
			"cloud_cover_mean",
			"relative_humidity_2m_mean",
			"shortwave_radiation_sum",
			"et0_fao_evapotranspiration",
			"sunshine_duration",
			"daylight_duration",
			"uv_index_max",
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

	const weatherData: WeatherData = {
		date: new Date(daily.time[0]),
		weatherCode: daily.weather_code[0],
		temperatureMax: daily.temperature_2m_max[0],
		temperatureMin: daily.temperature_2m_min[0],
		temperatureMean: daily.temperature_2m_mean[0],
		apparentTemperatureMax: daily.apparent_temperature_max[0],
		apparentTemperatureMin: daily.apparent_temperature_min[0],
		precipitationSum: daily.precipitation_sum[0],
		precipitationHours: daily.precipitation_hours[0],
		rainSum: daily.rain_sum[0],
		pressureMslMean: daily.pressure_msl_mean[0],
		windSpeedMax: daily.wind_speed_10m_max[0],
		windGustsMax: daily.wind_gusts_10m_max[0],
		windDirectionDominant: daily.wind_direction_10m_dominant[0],
		cloudCoverMean: daily.cloud_cover_mean[0],
		relativeHumidityMean: daily.relative_humidity_2m_mean[0],
		shortwaveRadiationSum: daily.shortwave_radiation_sum[0],
		et0FaoEvapotranspiration: daily.et0_fao_evapotranspiration[0],
		sunshineDuration: daily.sunshine_duration[0],
		daylightDuration: daily.daylight_duration[0],
		uvIndexMax: daily.uv_index_max[0],
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
