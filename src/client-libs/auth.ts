import { createAuthClient } from "better-auth/client";

export const authClient = createAuthClient({
	baseURL: import.meta.env.PUBLIC_SITE_URL || "http://localhost:4321",
});

export const { signIn, signOut } = authClient;
