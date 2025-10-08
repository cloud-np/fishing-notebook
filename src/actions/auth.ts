import { betterAuth } from "better-auth";
import { passkey } from "better-auth/plugins/passkey";
import { twoFactor } from "better-auth/plugins";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db, sqlite } from "@/db";
import * as schema from "@/db/schema";
import { getEmailService } from "@libs/services";
import { ActionError } from "astro:actions";

export const auth = betterAuth({
	database: drizzleAdapter(db, {
		provider: "sqlite",
		schema: {
			user: schema.user,
			session: schema.session,
			account: schema.account,
			verification: schema.verification,
		},
	}),
	baseURL: import.meta.env.BETTER_AUTH_URL || "http://localhost:4321",
	account: {
		accountLinking: {
			enabled: true,
			trustedProviders: ["google"],
		},
	},
	emailAndPassword: {
		enabled: false,
		disableSignUp: true,
		requireEmailVerification: true,
		minPasswordLength: 8,
		maxPasswordLength: 128,
		autoSignIn: true,
	},
	emailVerification: {
		sendOnSignUp: true,
		sendVerificationEmail: async ({ user, url, token }, request) => {
			// console.log(`Sending verification email to ${user.email}: ${url}`);
			await getEmailService().sendEmail({
				name: user.name,
				email: user.email,
				subject: "Verify your email address",
				html: `Click the link to verify your email: ${url}`,
			});
		},
	},
	socialProviders: {
		github: {
			clientId: import.meta.env.GITHUB_CLIENT_ID || "",
			clientSecret: import.meta.env.GITHUB_CLIENT_SECRET || "",
		},
	},
	plugins: [
		passkey(),
		twoFactor({
			otpOptions: {
				async sendOTP(user, otp) {
					console.log(`Sending OTP to ${(user as any).email}: ${otp}`);
					// await resend.emails.send({
					// 	from: "Acme <no-reply@demo.better-auth.com>",
					// 	to: user.email,
					// 	subject: "Your OTP",
					// 	html: `Your OTP is ${otp}`,
					// });
				},
			},
		}),
	],
	rateLimit: {
		enabled: true,
	},
});

export const createAuthorizedHandler = <TInput, TOutput>(
	handler: (input: TInput, context: any) => Promise<TOutput>
) => {
	return async (input: TInput, context: any) => {
		const session = await auth.api.getSession({
			headers: context.request.headers,
		});

		if (!session) {
			throw new ActionError({
				code: "UNAUTHORIZED",
				message: "You must be logged in to perform this action",
			});
		}

		return handler(input, context);
	};
};
