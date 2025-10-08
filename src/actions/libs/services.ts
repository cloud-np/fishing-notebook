import { EmailService } from "./emails";

const GLOBAL_EMAIL_SERVICE_KEY = Symbol.for("astro-email-service");

function initializeEmailService() {
	if (!globalThis[GLOBAL_EMAIL_SERVICE_KEY]) {
		globalThis[GLOBAL_EMAIL_SERVICE_KEY] = new EmailService();
	}
	return globalThis[GLOBAL_EMAIL_SERVICE_KEY];
}

export function getEmailService(): EmailService {
	return initializeEmailService();
}
