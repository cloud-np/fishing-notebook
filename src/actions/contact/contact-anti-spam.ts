import { type ActionAPIContext } from "astro:actions";
import { z } from "astro:schema";
import { ActionError } from "astro:actions";
import type { ContactDuplicateDetector } from "src/actions/contact/contact-duplicate-detector";
import type { RateLimiter } from "@libs/security/rate-limiter";
import { getDuplicateDetector, getRateLimiter } from "src/actions/contact/middlewares";
import { contactFormSchema } from "./contact.validation";

export class ContactAntiSpam {
	rateLimiter: RateLimiter;
	duplicateDetector: ContactDuplicateDetector;
	data: z.infer<typeof contactFormSchema>;
	context: ActionAPIContext;

	constructor(data: z.infer<typeof contactFormSchema>, context: ActionAPIContext) {
		this.rateLimiter = getRateLimiter();
		this.duplicateDetector = getDuplicateDetector();
		this.data = data;
		this.context = context;
	}

	validateAntiSpam() {
		const { request } = this.context;
		const ip =
			request.headers.get("cf-connecting-ip") ||
			request.headers.get("x-forwarded-for") ||
			request.headers.get("x-real-ip") ||
			"unknown";

		// Check if IP is blocked
		if (this.rateLimiter.isBlocked(ip)) {
			throw new ActionError({
				code: "FORBIDDEN",
				message: "Access denied",
			});
		}

		// Check rate limit
		if (!this.rateLimiter.checkRateLimit(ip)) {
			throw new ActionError({
				code: "TOO_MANY_REQUESTS",
				message: "Rate limit exceeded",
			});
		}

		// Check bot fingerprint
		if (!this.rateLimiter.checkBotFingerprint(request.headers)) {
			this.rateLimiter.addSuspiciousActivity(ip, "bot_detected");
			throw new ActionError({
				code: "FORBIDDEN",
				message: "Invalid request",
			});
		}

		// Honeypot check
		if (this.data.website && this.data.website.length > 0) {
			this.rateLimiter.addSuspiciousActivity(ip, "honeypot_triggered");
			// Don't throw error - just log and return success to not tip off bots
			console.warn(`Honeypot triggered by IP ${ip}`);
			return { honeypot: true };
		}

		// Duplicate check
		if (this.duplicateDetector.isDuplicate(this.data.email, this.data.message)) {
			this.rateLimiter.addSuspiciousActivity(ip, "duplicate_content");
			throw new ActionError({
				code: "BAD_REQUEST",
				message: "Duplicate submission",
			});
		}

		// TODO: Timestamp should be from the time they try to fill the form
		// Timing check
		// if (this.data.timestamp) {
		// 	const submissionTime = Date.now() - this.data.timestamp;
		// 	if (submissionTime < ONE_SECOND * 3) { // Less than 3 seconds
		// 		console.log("!! submissionTime: ", submissionTime);
		// 		this.rateLimiter.addSuspiciousActivity(ip, 'too_fast_submission');
		// 		throw new ActionError({
		// 			code: 'BAD_REQUEST',
		// 			message: 'Invalid submission'
		// 		});
		// 	}
		// }

		return { valid: true };
	}
}
