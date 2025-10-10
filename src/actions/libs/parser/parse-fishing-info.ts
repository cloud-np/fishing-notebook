import { fetchHTMLWithDate } from "./doc-fetcher";
import { parseBarometerGraphics } from "./parser";

/**
 * Fetch and parse fishing information from tides4fishing.com
 * @param location - The location path (e.g., 'gr/egeo/ermoupoli')
 * @param fecha - The date to fetch data for
 * @returns Parsed fishing information
 */
export async function fetchFishingInfo(location: string, fecha: Date = new Date()) {
	const url = `https://tides4fishing.com/${location}`;

	console.log(`Fetching fishing info for ${location} on ${fecha.toISOString()}`);

	const html = await fetchHTMLWithDate(url, fecha);

	// Parse barometer graphics
	const barometers = parseBarometerGraphics(html);

	return {
		location,
		fecha,
		barometers,
		rawHtml: html,
	};
}

/**
 * Fetch fishing info for Ermoupoli, Greece
 * @param fecha - The date to fetch data for (defaults to today)
 */
export async function fetchErmoupoliFishingInfo(fecha: Date = new Date()) {
	return fetchFishingInfo("gr/egeo/ermoupoli", fecha);
}

// Example usage
if (import.meta.url === `file://${process.argv[1]}`) {
	const testDate = new Date("2025-10-11");
	fetchErmoupoliFishingInfo(testDate)
		.then(data => {
			console.log("Fishing Info:", JSON.stringify(data, null, 2));
		})
		.catch(error => {
			console.error("Error:", error);
		});
}
