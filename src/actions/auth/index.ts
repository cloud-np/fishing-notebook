import { betterAuth } from "better-auth";
import { passkey } from "better-auth/plugins/passkey";
import { twoFactor } from "better-auth/plugins";
import Database from "better-sqlite3";

export const auth = betterAuth({
	database: new Database("./auth.sqlite"),
	baseURL: process.env.BETTER_AUTH_URL || "http://localhost:4321",
	account: {
		accountLinking: {
			enabled: true,
			trustedProviders: ["google"],
		},
	},
	emailAndPassword: {
		enabled: true,
		async beforeSignUp(data) {
			// Add Zod validation here
			console.log("Before sign up");
			return data;
		},
		async afterSignUp(data) {
			// Add custom logic here
			console.log("After sign up");
			return data;
		},
	},
	socialProviders: {
		google: {
			clientId: process.env.GOOGLE_CLIENT_ID || "",
			clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
		},
		github: {
			clientId: process.env.GITHUB_CLIENT_ID || "",
			clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
		},
	},
	plugins: [
		passkey(),
		twoFactor({
			otpOptions: {
				async sendOTP(user, otp) {
					console.log(`Sending OTP to ${user.email}: ${otp}`);
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
