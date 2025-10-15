import { createAuthClient } from "better-auth/client";

// Use the current origin when running in the browser, otherwise use the env variable
const getBaseURL = () => {
	if (typeof window !== "undefined") {
		return window.location.origin;
	}
	return import.meta.env.PUBLIC_SITE_URL || "http://localhost:4321";
};

export const authClient = createAuthClient({
	baseURL: getBaseURL(),
});

export const { signIn, signUp, signOut } = authClient;
