export interface FetchOptions {
	method?: "GET" | "POST";
	formData?: Record<string, string | number | Date>;
	headers?: Record<string, string>;
}

/**
 * Fetch HTML content from a URL
 * @param url - The URL to fetch from
 * @param options - Optional configuration for the request
 * @returns The HTML content as a string
 */
export async function fetchHTML(url: string, options: FetchOptions = {}): Promise<string> {
	const { method = "GET", formData, headers = {} } = options;

	const fetchOptions: RequestInit = {
		method,
		headers: {
			"Content-Type": "application/x-www-form-urlencoded",
			...headers,
		},
	};

	// If formData is provided, convert it to URLSearchParams
	if (formData && method === "POST") {
		const params = new URLSearchParams();

		for (const [key, value] of Object.entries(formData)) {
			if (value instanceof Date) {
				params.append(key, value.toISOString());
			} else {
				params.append(key, String(value));
			}
		}

		fetchOptions.body = params.toString();
	}

	try {
		const response = await fetch(url, fetchOptions);

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		return await response.text();
	} catch (error) {
		throw new Error(
			`Failed to fetch HTML from ${url}: ${error instanceof Error ? error.message : "Unknown error"}`
		);
	}
}

/**
 * Fetch HTML with POST request and fecha parameter
 * @param url - The URL to fetch from
 * @param fecha - The date to send (defaults to current date)
 * @returns The HTML content as a string
 */
export async function fetchHTMLWithDate(url: string, fecha: Date = new Date()): Promise<string> {
	return fetchHTML(url, {
		method: "POST",
		formData: {
			fecha,
		},
	});
}
