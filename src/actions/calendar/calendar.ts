import { ActionError, defineAction } from "astro:actions";
import { createAuthorizedHandler } from "src/actions/auth";
import { dateSchema } from "./calendar.validation";

let lastFetchedPosition: { latitude: number; longitude: number } = { latitude: 0, longitude: 0 };

export const calendar = {
	fetchDay: defineAction({
		accept: "json",
		input: dateSchema,
		handler: createAuthorizedHandler(async (input, context) => {
			console.log("Checking date:", input.date);
			const { date, latitude, longitude } = input;
			try {
				// Example coordinates (you'll need to get these from the location)

				// We don't need to check if its the same day being fetched
				// since if the user doesn't change the position we won't fetch anyway.
				// In the case he switches the position we will fetch again anyway.
				// if (
				// 	!shouldFetchWeatherBasedOnPosition(
				// 		latitude,
				// 		longitude,
				// 		lastFetchedPosition.latitude,
				// 		lastFetchedPosition.longitude
				// 	)
				// ) {
				// 	// TODO: Should return object from the DB.
				// 	return {
				// 		success: true,
				// 		date: input.date,
				// 		weather: null,
				// 	};
				// }
				// const weatherData = await fetchWeatherData(latitude, longitude, input.date);
				lastFetchedPosition = { latitude, longitude };

				return {
					success: true,
					date: input.date,
					// weather: weatherData,
					weather: null,
				};
			} catch (error) {
				throw new ActionError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Failed to fetch weather data",
				});
			}
		}),
	}),
};
