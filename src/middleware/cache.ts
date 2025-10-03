import type { APIContext, MiddlewareNext } from 'astro';

export async function cache(context: APIContext, next: MiddlewareNext) {
	const response = await next();
	const url = new URL(context.request.url);

	// Set cache headers for static assets
	if (url.pathname.startsWith('/fonts/')) {
		response.headers.set('Cache-Control', 'public, max-age=31536000, immutable'); // 1 year
	} else if (url.pathname.match(/\.(css|js|ico|svg|png|jpg|jpeg|webp|woff2|woff)$/)) {
		response.headers.set('Cache-Control', 'public, max-age=31536000, immutable'); // 1 year
	}

	return response;
}
