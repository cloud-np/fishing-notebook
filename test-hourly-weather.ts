import { WeatherService } from "./src/actions/libs/weather.service";

async function main() {
	const weatherService = new WeatherService();

	// Athens coordinates
	const latitude = 37.9838;
	const longitude = 23.7278;
	const date = "2025-10-23"; // Format: YYYY-MM-DD

	console.log(`Fetching hourly weather data for ${date}...\n`);

	try {
		const data = await weatherService.getHourlyWeather(date, latitude, longitude);

		console.log("Weather data fetched successfully!\n");
		console.log(`Location: ${data.latitude}°N, ${data.longitude}°E`);
		console.log(`Elevation: ${data.elevation}m`);
		console.log(`Timezone: ${data.timezone} (${data.timezone_abbreviation})`);
		console.log(`Total hours: ${data.hourly.time.length}\n`);

		// Show first 5 hours of data as an example
		console.log("First 5 hours of data:");
		for (let i = 0; i < Math.min(5, data.hourly.time.length); i++) {
			// Parse the ISO time string and format it for the location's timezone
			const timeStr = data.hourly.time[i];
			const date = new Date(timeStr);
			const localTime = date.toLocaleString("en-US", {
				timeZone: data.timezone,
				year: "numeric",
				month: "2-digit",
				day: "2-digit",
				hour: "2-digit",
				minute: "2-digit",
				hour12: false,
			});

			console.log(`\nTime: ${localTime} (${data.timezone_abbreviation})`);
			console.log(`  Temperature: ${data.hourly.temperature_2m[i]}°C`);
			console.log(`  Weather Code: ${data.hourly.weather_code[i]}`);
			console.log(`  Wind Speed: ${data.hourly.wind_speed_10m[i]} km/h`);
			console.log(`  Wind Direction: ${data.hourly.wind_direction_10m[i]}°`);
			console.log(`  Humidity: ${data.hourly.relative_humidity_2m[i]}%`);
			console.log(`  Precipitation: ${data.hourly.precipitation[i]} mm`);
		}

		if (data.hourly.time.length > 5) {
			console.log(`\n... and ${data.hourly.time.length - 5} more hours of data available`);
		}
	} catch (error) {
		console.error("Error fetching hourly weather:", error);
	}
}

main();
