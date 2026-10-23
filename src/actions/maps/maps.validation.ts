import { z } from "astro:schema";

// Country-code TLDs as used by Google: com, gr, co.uk, com.au, ...
const GOOGLE_TLD = "(?:com|[a-z]{2}|(?:co|com)\\.[a-z]{2})";
const MAPS_GOOGLE_HOST = new RegExp(`^maps\\.google\\.${GOOGLE_TLD}$`);
const GOOGLE_HOST = new RegExp(`^(?:www\\.)?google\\.${GOOGLE_TLD}$`);

function isMapsPath(pathname: string): boolean {
	return pathname === "/maps" || pathname.startsWith("/maps/");
}

/**
 * Only https Google Maps URLs are allowed. The hostname is matched exactly (never by substring)
 * so look-alikes such as `google.com.evil.example` are rejected.
 */
export function isGoogleMapsUrl(url: URL): boolean {
	if (url.protocol !== "https:" || url.username || url.password || url.port) {
		return false;
	}

	const host = url.hostname.toLowerCase();

	if (host === "maps.app.goo.gl") {
		return true;
	}
	if (host === "goo.gl") {
		return isMapsPath(url.pathname);
	}
	if (MAPS_GOOGLE_HOST.test(host)) {
		return true;
	}
	if (GOOGLE_HOST.test(host)) {
		return isMapsPath(url.pathname);
	}
	return false;
}

export const mapsUrlSchema = z.object({
	url: z
		.string()
		.url("Invalid URL format")
		.refine(
			value => {
				try {
					return isGoogleMapsUrl(new URL(value));
				} catch {
					return false;
				}
			},
			{
				message:
					"Please enter a valid Google Maps link (https://maps.app.goo.gl/... or https://www.google.com/maps/...)",
			}
		),
});

export type MapsUrlInput = z.infer<typeof mapsUrlSchema>;
