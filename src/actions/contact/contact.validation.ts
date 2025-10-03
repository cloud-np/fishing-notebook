import { z } from "astro:schema";

const DISPOSABLE_EMAIL_DOMAINS = [
	'10minutemail.com', 'tempmail.org', 'guerrillamail.com',
	'mailinator.com', 'yopmail.com', 'temp-mail.org', 'throwaway.email'
];

const SUSPICIOUS_PATTERNS = [
	/\+.{10,}@/, // Long plus addressing
	/t.*test/i, // Multiple "test" in email
];

const emailSchema = z
	.string()
	.email()
	.max(254)
	.refine((email) => {
		// Additional backend-only validations
		const [localPart, domain] = email.split('@');

		// Local part cannot exceed 64 characters (RFC 5321)
		if (localPart.length > 64) return false;

		// Domain cannot exceed 253 characters
		if (domain.length > 253) return false;

		// No consecutive dots
		if (email.includes('..')) return false;

		// Cannot start or end with dot
		if (localPart.startsWith('.') || localPart.endsWith('.')) return false;

		// Block disposable email domains
		return !DISPOSABLE_EMAIL_DOMAINS.includes(domain);
	}, 'Invalid email domain')
	.refine((email) => {
		// Block suspicious patterns
		return !SUSPICIOUS_PATTERNS.some(pattern => pattern.test(email));
	}, 'Invalid email format');

export const contactFormSchema = z.object({
	email: emailSchema,
	name: z.string().min(1).max(100),
	phoneCode: z.string().min(1).max(3).optional().default('30'),
	phone: z.string().min(7).max(15),
	subject: z.string().max(100).default(''),
	message: z.string().max(600).optional().default(''),
	// Honeypot field - should be empty
	website: z.string().max(0).optional().default(''),
	// Timestamp for timing validation
	// timestamp: z.string().transform(val => Number(val)),
});
