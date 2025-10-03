import { ONE_HOUR, ONE_MINUTE } from "@data/time.const";
import crypto from 'node:crypto';

export class ContactDuplicateDetector {
	recentSubmissions: Map<string, number>;

	constructor() {
		this.recentSubmissions = new Map(); // hash -> timestamp
		setInterval(() => this.cleanup(), ONE_MINUTE * 5); // Clean every 5 minutes
	}

	cleanup() {
		const oneHourAgo = Date.now() - ONE_HOUR;
		for (const [hash, timestamp] of this.recentSubmissions) {
			if (timestamp < oneHourAgo) {
				this.recentSubmissions.delete(hash);
			}
		}
	}

	// TODO: Can we abstracted by providing this function to be checked as "isDuplicate"
	isDuplicate(email: string, message: string) {
		const emailHash = this.hash(email);
		const messageHash = this.hash(message);
		const now = Date.now();

		// Check if same email or message was submitted recently
		if (this.recentSubmissions.has(emailHash) || this.recentSubmissions.has(messageHash)) {
			return true;
		}

		// Store hashes
		this.recentSubmissions.set(emailHash, now);
		this.recentSubmissions.set(messageHash, now);

		return false;
	}

	hash(text: string) {
		return crypto.createHash('sha256').update(text).digest('hex');
	}
}
