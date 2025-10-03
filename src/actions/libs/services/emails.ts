import nodemailer from "nodemailer";

export interface SendEmail {
	email: string;
	html: string;
	subject: string;
	name: string;
}

export class EmailService {
	transporter: nodemailer.Transporter;
	fromEmail = import.meta.env.GMAIL_USER;

	constructor() {
		// Slightly less secure, maybe we need to setup the SSL ca in Docker
		// but this works for now. Later on we can check if we can update this.
		this.transporter = nodemailer.createTransport({
			host: 'smtp.gmail.com',
			port: 587,
			secure: false, // true for 465, false for other ports
			auth: {
				user: this.fromEmail,
				pass: import.meta.env.GMAIL_PASS,
			},
			tls: {
				ciphers: 'SSLv3',
				rejectUnauthorized: false
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
			console.log('✅ SMTP connection verified successfully');
		} catch (error) {
			console.error('❌ SMTP connection failed:', error);
			throw error;
		}
	}

	async sendEmail(props: SendEmail) {
		let message = {
			from: this.fromEmail,
			to: this.fromEmail, // send to self
			subject: props.subject,
			name: props.name,
			replyTo: props.email,
			html: `
				<h1>Φόρμα επικοινωνίας</h1><br>
				<b>Name</b>: ${props.name}<br>
				<b>Email</b>: ${props.email}<br>
				<b>Message</b>: ${props.html}
			`,
		};

		return await this.transporter.sendMail(message);
	}
}
