import { defineAction } from "astro:actions";
import { z } from "astro:schema";
import { auth } from "./index";

export const signUp = defineAction({
	accept: "form",
	input: z.object({
		email: z.string().email(),
		password: z.string().min(8),
		name: z.string().min(2),
		image: z.string().url().optional(),
	}),
	handler: async ({ email, password, name, image }) => {
		try {
			const response = await auth.api.signUpEmail({
				body: {
					email,
					password,
					name,
					image,
				},
			});

			return {
				success: true,
				data: response,
			};
		} catch (error: any) {
			throw new Error(error.message || "Failed to sign up");
		}
	},
});

export const signIn = defineAction({
	accept: "form",
	input: z.object({
		email: z.string().email(),
		password: z.string().min(8),
	}),
	handler: async ({ email, password }) => {
		try {
			const response = await auth.api.signInEmail({
				body: {
					email,
					password,
				},
			});

			console.log(response);

			return {
				success: true,
				data: response,
			};
		} catch (error: any) {
			throw new Error(error.message || "Failed to sign in");
		}
	},
});

export const signOut = defineAction({
	accept: "form",
	handler: async (_, context) => {
		try {
			const response = await auth.api.signOut({
				headers: context.request.headers,
			});

			return {
				success: true,
				data: response,
			};
		} catch (error: any) {
			throw new Error(error.message || "Failed to sign out");
		}
	},
});
