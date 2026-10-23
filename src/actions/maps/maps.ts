import { ActionError, defineAction } from "astro:actions";
import { createAuthorizedHandler } from "src/actions/auth";
import { isGoogleMapsUrl, mapsUrlSchema } from "./maps.validation";

const MAX_REDIRECTS = 5;
const REDIRECT_STATUSES = new Set([301, 302, 303, 307, 308]);

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
		handler: createAuthorizedHandler(async (input: { url: string }) => {
			try {
				// Redirects are followed manually so every hop can be checked against the Google Maps allowlist
				let currentUrl = new URL(input.url);
				let response: Response;
				let hops = 0;

				while (true) {
					response = await fetch(currentUrl, {
						redirect: "manual",
						headers: {
							"User-Agent":
								"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
							// The body is never needed, so don't ask the server for a compressed one
							"Accept-Encoding": "identity",
						},
					});

					const location = response.headers.get("location");
					if (!REDIRECT_STATUSES.has(response.status) || !location) {
						break;
					}

					// Drop the redirect body without reading (and decoding) it
					await response.body?.cancel();

					if (hops >= MAX_REDIRECTS) {
						throw new ActionError({
							code: "BAD_REQUEST",
							message: "Too many redirects while resolving the Google Maps link",
						});
					}
					hops++;

					let nextUrl: URL;
					try {
						nextUrl = new URL(location, currentUrl);
					} catch {
						throw new ActionError({
							code: "BAD_REQUEST",
							message: "Invalid redirect while resolving the Google Maps link",
						});
					}
					if (!isGoogleMapsUrl(nextUrl)) {
						throw new ActionError({
							code: "BAD_REQUEST",
							message: "The link redirects outside of Google Maps",
						});
					}
					currentUrl = nextUrl;
				}

				await response.body?.cancel();

				if (!response.ok) {
					throw new ActionError({
						code: "BAD_REQUEST",
						message: `Failed to fetch URL: ${response.statusText}`,
					});
				}

				const coordinates = parseCoordinates(currentUrl.href);
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
		}),
	}),
};
