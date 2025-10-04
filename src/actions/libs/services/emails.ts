import nodemailer from "nodemailer";
import { Resend } from "resend";
import { settings } from "src/settings.const";

export interface SendEmail {
	email: string;
	html: string;
	subject: string;
	name: string;
}

export class EmailService {
	readonly transporter: nodemailer.Transporter;
	gmailFromEmail = import.meta.env.GMAIL_USER;
	readonly resend: Resend;

	constructor() {
		this.resend = new Resend(import.meta.env.RESEND_API_KEY);
		// Slightly less secure, maybe we need to setup the SSL ca in Docker
		// but this works for now. Later on we can check if we can update this.
		this.transporter = nodemailer.createTransport({
			host: "smtp.gmail.com",
			port: 587,
			secure: false, // true for 465, false for other ports
			auth: {
				user: this.gmailFromEmail,
				pass: import.meta.env.GMAIL_PASS,
			},
			tls: {
				ciphers: "SSLv3",
				rejectUnauthorized: false,
			},
			pool: true,
			maxConnections: 1,
			rateDelta: 20000,
			rateLimit: 5,
		});
		// Verify connection on startup
		this.verifyConnection();
	}

	private async verifyConnection(): Promise<void> {
		try {
			await this.transporter.verify();
			console.log("✅ SMTP connection verified successfully");
		} catch (error) {
			console.error("❌ SMTP connection failed:", error);
			throw error;
		}
	}

	async sendEmail(props: SendEmail) {
		let message = {
			from: "Fish " + settings.site,
			to: props.email,
			subject: props.subject,
			name: props.name,
			replyTo: props.email,
			html: `
				<h1>Test email</h1><br>
				<b>Name</b>: ${props.name}<br>
				<b>Email</b>: ${props.email}<br>
				<b>Message</b>: ${props.html}
			`,
		};

		return await this.resend.emails.send({ ...message });
	}

	// Since its a contact email we can utilize the
	// Gmail API to send the email which is free.
	async sendContactEmail(props: SendEmail) {
		let message = {
			from: this.gmailFromEmail,
			to: this.gmailFromEmail, // send to self
			subject: props.subject,
			name: props.name,
			replyTo: props.email,
			html: `
				<h1>Contact mail from:</h1><br>
				<b>Name</b>: ${props.name}<br>
				<b>Email</b>: ${props.email}<br>
				<b>Message</b>: ${props.html}
			`,
		};

		return await this.transporter.sendMail(message);
	}
}
