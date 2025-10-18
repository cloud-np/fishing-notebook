import { defineMiddleware } from "astro:middleware";
import { auth } from "@auth";

const PUBLIC_ROUTES: readonly string[] = ["/login", "/api/auth", "/~partytown/"];

export const authMiddleware = defineMiddleware(async (context, next) => {
	// Whitelist: routes that don't require authentication
	const isPublicRoute = PUBLIC_ROUTES.some(route => context.url.pathname.startsWith(route));

	// If not public, require authentication
	if (!isPublicRoute) {
		const session = await auth.api.getSession({
			headers: context.request.headers,
		});

		if (!session) {
			return context.redirect("/login");
		}
	}

	return next();
});
