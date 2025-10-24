export namespace Helpers {
	export const formatDate = (date: Date): string =>
		new Date(date).toLocaleDateString("en-US", {
			year: "numeric",
			month: "long",
			day: "numeric",
		});

	export const slugify = (str: string): string =>
		str
			.toString()
			.trim()
			.toLowerCase()
			.replace(/\s+/g, "-")
			.replace(/[^\w\-]+/g, "")
			.replace(/\-\-+/g, "-")
			.replace(/^-+/, "")
			.replace(/-+$/, "");

	export const generateCategoryData = (categories: Set<string>): { name: string; slug: string }[] =>
		[...categories].map(category => ({
			name: category,
			slug: `${slugify(category)}`,
		}));

	export const normalizeIndex = (nonNormalIndex: number, arrLen: number): number => {
		if (nonNormalIndex >= arrLen) {
			return arrLen - 1;
		} else if (nonNormalIndex < 0) {
			return 0;
		}
		// At this point is safe/normal
		return nonNormalIndex;
	};
}

/**
 * Round coordinates to 4 decimal places for consistent storage and querying
 * 4 decimal places gives ~11 meter precision which is sufficient for weather data
 */
export const roundCoordinate = (coord: number): number => {
	return Math.round(coord * 10000) / 10000;
};

export const userValueToPosition = (dmsString: string | undefined): number[] | undefined => {
	if (!dmsString) return undefined;

	// Split the string into latitude and longitude parts
	const parts = dmsString?.trim().split(/\s+/);

	function convertPart(part: string): number | undefined {
		let match: RegExpMatchArray | null = null;
		try {
			// Extract degrees, minutes, seconds, and direction
			match = part.match(/(\d+)°(\d+)'([\d.]+)"([NSEW])/);
		} finally {
			if (!match) {
				return undefined;
			}
		}

		const degrees = parseFloat(match[1]);
		const minutes = parseFloat(match[2]);
		const seconds = parseFloat(match[3]);
		const direction = match[4];

		// Convert to decimal
		let decimal = degrees + minutes / 60 + seconds / 3600;

		// Apply negative sign for South and West
		if (direction === "S" || direction === "W") {
			decimal = -decimal;
		}

		return decimal;
	}

	const latitude = convertPart(parts[0]);
	const longitude = convertPart(parts[1]);

	// TODO: With regex we can clean this a bit
	if (!latitude || !longitude) {
		const parsed = dmsString.split(",")?.map(val => parseFloat(val.replace(/[^0-9.-]/g, "")));
		// I think keeping removing 0 its fine
		if (isNaN(parsed[0]) || isNaN(parsed[1]) || !parsed[0] || !parsed[1]) {
			return undefined;
		}
		return [parsed[0], parsed[1]];
	}

	return [latitude, longitude];
};
