import { ContactDuplicateDetector } from "./contact-duplicate-detector";
import { RateLimiter } from "../libs/security/rate-limiter";

const GLOBAL_RATE_LIMITER_KEY = Symbol.for("astro-rate-limiter");
const GLOBAL_DUPLICATE_DETECTOR_KEY = Symbol.for("astro-duplicate-detector");

// TODO: This need to be changed to initialize once per endpoint we need to protect
function initializeRateLimiter() {
	if (!globalThis[GLOBAL_RATE_LIMITER_KEY]) {
		globalThis[GLOBAL_RATE_LIMITER_KEY] = new RateLimiter();
	}
	return globalThis[GLOBAL_RATE_LIMITER_KEY];
}

function initializeDuplicateDetector() {
	if (!globalThis[GLOBAL_DUPLICATE_DETECTOR_KEY]) {
		globalThis[GLOBAL_DUPLICATE_DETECTOR_KEY] = new ContactDuplicateDetector();
	}
	return globalThis[GLOBAL_DUPLICATE_DETECTOR_KEY];
}

export function getRateLimiter() {
	return initializeRateLimiter();
}

export function getDuplicateDetector() {
	return initializeDuplicateDetector();
}
