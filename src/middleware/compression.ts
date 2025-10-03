import { defineMiddleware } from "astro:middleware";

type CompressionFormat = "gzip" | "deflate";

// Need to be careful with Astro middlewares because for
// static pages these runs once on the build time. This means
// that things like cookies, headers like "Accept-Encoding"
// IF we run the astro-compression plugin this should NOT run again
// otherwise we are sending trash to the user. Similarly I assume if
// our given CDN does the compression this should be disabled all together.
export const compression = defineMiddleware(
	async ({ request, isPrerendered }, next) => {
		const response = await next();

		// Skip if its prerendered since its already compressed
		// or if it has no body
		if (!response.body || isPrerendered) {
			return response;
		}

		// Check if content is compressible
		// Or if its a prerendered page which means compress it.
		const contentType = response.headers.get("Content-Type");
		const isCompressible =
			contentType && (contentType.includes("text/") ||
				contentType.includes("application/json") ||
				contentType.includes("application/javascript") ||
				contentType.includes("application/xml"));

		if (!isCompressible) {
			return response;
		}

		// Determine compression type
		let compressionType: CompressionFormat = "gzip";

		// During build time, request headers might not contain Accept-Encoding
		// or might be different from actual client requests
		const acceptEncoding = request.headers.get("Accept-Encoding") || "";

		if (acceptEncoding) {
			// Runtime: check client's accepted encodings
			const acceptedEncodings = acceptEncoding
				.split(",")
				.map((encoding) => encoding.trim().toLowerCase());

			if (acceptedEncodings.includes("gzip")) {
				compressionType = "gzip";
			} else if (acceptedEncodings.includes("deflate")) {
				compressionType = "deflate";
			} else {
				// Client doesn't support compression we can provide
				return response;
			}
		} else {
			// Build time: default to gzip since most browsers support it
			// Modern browsers universally support gzip
			compressionType = "gzip";
		}

		try {
			// Compress the response body
			const compressedBody = response.body.pipeThrough(
				new CompressionStream(compressionType),
			);

			// Create new headers with compression info
			const newHeaders = new Headers(response.headers);
			newHeaders.set("Content-Encoding", compressionType);

			// Add Vary header to indicate response varies based on Accept-Encoding
			// This is important for caching
			newHeaders.set("Vary", "Accept-Encoding");

			return new Response(compressedBody, {
				status: response.status,
				statusText: response.statusText,
				headers: newHeaders,
			});
		} catch (error) {
			// If compression fails, return original response
			console.warn("Compression failed:", error);
			return response;
		}
	},
);
