import { cookie } from "./cookie.const";
import { gallery } from "./gallery.const";
import { settings } from "../settings.const";

export const languages = {
	el: "Ελληνικά",
	en: "English",
};

export const defaultLang = "el";

export const ui = {
	nav: {
		home: {
			el: "Αρχική",
			en: "Home",
		},
		contact: {
			el: "Επικοινωνία",
			en: "Contact",
		},
		kitchens: {
			el: "Κουζίνες",
			en: "Kitchens",
		},
		bathrooms: {
			el: "Μπάνια",
			en: "Bathrooms",
		},
		projects: {
			el: "Έργα",
			en: "Projects",
		},
		bedrooms: {
			el: "Υπνοδωμάτια",
			en: "Bedrooms",
		},
	},
	gallery,
	cookie,
	settings,
} as const;
