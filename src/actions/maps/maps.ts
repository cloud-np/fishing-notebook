import { ActionError, defineAction } from "astro:actions";
import { mapsUrlSchema } from "./maps.validation";

interface Coordinates {
	latitude: number;
	longitude: number;
}

function parseCoordinates(fullUrl: string): Coordinates {
	// Extract from /@lat,lng, pattern
	const atMatch = fullUrl.replace("https://www.google.com/maps/search/", "").split(",");
	if (atMatch) {
		return {
			latitude: parseFloat(atMatch[0]),
			longitude: parseFloat(atMatch[1].replace("+", "").split("?")[0]),
		};
	}

	throw new ActionError({
		code: "BAD_REQUEST",
		message: "Could not extract coordinates from URL",
	});
}

export const maps = {
	extractCoordinates: defineAction({
		accept: "json",
		input: mapsUrlSchema,
		handler: async input => {
			try {
				const response = await fetch(input.url, {
					redirect: "follow",
					headers: {
						"User-Agent":
							"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
					},
				});

				if (!response.ok) {
					throw new ActionError({
						code: "BAD_REQUEST",
						message: `Failed to fetch URL: ${response.statusText}`,
					});
				}

				const coordinates = parseCoordinates(response.url);
				return {
					success: true,
					coordinates,
				};
			} catch (error) {
				if (error instanceof ActionError) {
					throw error;
				}
				throw new ActionError({
					code: "INTERNAL_SERVER_ERROR",
					message: `Failed to extract coordinates: ${(error as Error).message}`,
				});
			}
		},
	}),
};
