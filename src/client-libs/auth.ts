import { createAuthClient } from "better-auth/client";

// Use the current origin when running in the browser, otherwise use the env variable
const getBaseURL = () => {
	if (typeof window !== "undefined") {
		return window.location.origin;
	}
	return import.meta.env.PUBLIC_SITE_URL || "http://localhost:4321";
};

export const authClient = createAuthClient({
	// https://www.better-auth.com/docs/concepts/client#create-client-instance
	// Since our Auth server runs on the same domain as our client we could skip this.
	baseURL: getBaseURL(),
});

export const { signIn, signUp, signOut } = authClient;
