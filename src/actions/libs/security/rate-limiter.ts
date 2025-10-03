import { ONE_DAY, ONE_HOUR, ONE_MINUTE } from "@data/time.const";

// A rate limiter deployed on specific endpoints. Not every req.
export class RateLimiter {
	requests: Map<string, { count: number; windowStart: number }>;
	blockedIPs: Map<string, { until: number; reason: string }>;
	suspiciousIPs: Map<string, { count: number; firstSeen: number }>;

	constructor() {
		this.requests = new Map(); // IP -> { count, windowStart, blocked }
		this.blockedIPs = new Map(); // IP -> { until, reason }
		this.suspiciousIPs = new Map(); // IP -> { count, firstSeen }

		// Cleanup every 10 minutes
		setInterval(() => this.cleanup(), ONE_MINUTE * 10);
	}

	cleanup() {
		const now = Date.now();

		// Clean rate limiting windows
		for (const [ip, data] of this.requests) {
			if (now - data.windowStart > ONE_MINUTE * 15) { // 15 min window
				this.requests.delete(ip);
			}
		}

		// Clean expired blocks
		for (const [ip, data] of this.blockedIPs) {
			if (data.until < now) {
				this.blockedIPs.delete(ip);
			}
		}

		// Clean old suspicious activity
		for (const [ip, data] of this.suspiciousIPs) {
			if (now - data.firstSeen > ONE_DAY) { // 24 hours
				this.suspiciousIPs.delete(ip);
			}
		}
	}

	checkRateLimit(ip: string, limit = 3, window = ONE_MINUTE * 15) {
		const now = Date.now();
		const record = this.requests.get(ip) || { count: 0, windowStart: now };

		// Reset window if expired
		if (now - record.windowStart > window) {
			record.count = 0;
			record.windowStart = now;
		}

		record.count++;
		this.requests.set(ip, record);

		if (record.count > limit) {
			this.addSuspiciousActivity(ip, 'rate_limit_exceeded');
			return false;
		}

		return true;
	}

	isBlocked(ip: string) {
		const blocked = this.blockedIPs.get(ip);
		return blocked && blocked.until > Date.now();
	}

	addSuspiciousActivity(ip: string, reason = 'unknown') {
		const current = this.suspiciousIPs.get(ip) || { count: 0, firstSeen: Date.now() };
		current.count++;

		// Block after 5 suspicious activities in 1 hour
		if (current.count >= 5 && (Date.now() - current.firstSeen) < ONE_HOUR) {
			this.blockedIPs.set(ip, {
				until: Date.now() + ONE_DAY, // 24 hour block
				reason: 'suspicious_activity'
			});
			console.warn(`IP ${ip} blocked for suspicious activity: ${reason}`);
		}

		this.suspiciousIPs.set(ip, current);
	}

	checkBotFingerprint(headers: Headers) {
		const userAgent = headers.get('user-agent') || '';
		const acceptLanguage = headers.get('accept-language') || '';

		// Basic bot detection
		const botPatterns = [
			/bot/i, /crawler/i, /spider/i, /curl/i, /wget/i,
			/postman/i, /insomnia/i, /python/i, /go-http/i
		];

		if (botPatterns.some(pattern => pattern.test(userAgent))) {
			return false;
		}

		// Check for missing common headers
		if (!acceptLanguage && !userAgent.includes('Mozilla')) {
			return false;
		}

		return true;
	}
}
