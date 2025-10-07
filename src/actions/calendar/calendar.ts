import { defineAction } from "astro:actions";

export const calendar = {
	sendEmail: defineAction({
		accept: "form",
		input: contactFormSchema,
		handler: async (input, context) => {
			try {
				// Run anti-spam validation
				const validation = new ContactAntiSpam(input, context).validateAntiSpam();

				// If honeypot was triggered, return fake success
				if (validation.honeypot) {
					return { success: true, message: "Thank you for your message!" };
				}

				await getEmailService().sendEmail({
					email: input.email,
					html: input.message,
					subject: `Νέο μήνυμα από ${input.name}`,
					name: input.name,
				});

				return {
					success: true,
					message: "Thank you for your message! We'll get back to you soon.",
				};
			} catch (error) {
				if (error instanceof ActionError) {
					throw error;
				}

				throw new ActionError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Failed to send message",
				});
			}
		},
	}),
};
