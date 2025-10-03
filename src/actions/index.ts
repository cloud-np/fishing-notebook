import { getEmailService } from "@libs/services/services";
import { contact } from "./contact/contact";
import { getRateLimiter, getDuplicateDetector } from "src/actions/contact/middlewares";
import { signUp, signIn, signOut } from "./auth/auth";

// TODO: We need a better pattern for this
// Start the Global instances of rate limiter and duplicate detector
// Middlewares
getRateLimiter();
getDuplicateDetector();

// Services
getEmailService();

export const server = {
	contact,
	signUp,
	signIn,
	signOut,
};
