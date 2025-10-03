import b1 from "@assets/bathrooms/b1.webp";
import b2 from "@assets/bathrooms/b2.webp";
import b3 from "@assets/bathrooms/b3.webp";
import b4 from "@assets/bathrooms/b4.webp";
import b5 from "@assets/bathrooms/b5.webp";
import b6 from "@assets/bathrooms/b6.webp";
import type { LocalImage } from "@client-libs/images";

export const BATHROOMS_IMAGES: LocalImage[] = [
	{
		imageMetadata: b1,
		alt: "Μοντέρνο μπάνιο με σκούρα γκρι πλακάκια, επιτοίχια τουαλέτα, πλωτό νιπτήρα και λευκή μπανιέρα.",
	},
	{ imageMetadata: b2, alt: "Πολυτελές σκούρο ντους με κεφαλή ντους βροχής και ξύλινο πάγκο." },
	{ imageMetadata: b3, alt: "Σύγχρονο ντους με γκρι μαρμάρινους τοίχους και ενσωματωμένες εσοχές αποθήκευσης." },
	{ imageMetadata: b4, alt: "Μινιμαλιστικό μπάνιο με τσιμεντένιους τοίχους, επιτοίχια τουαλέτα και γυάλινο ντους." },
	{ imageMetadata: b5, alt: "Κομψό νιπτήρα μπάνιου με μαρμάρινους τοίχους και νιπτήρα σε ξύλινο πάγκο." },
	{ imageMetadata: b6, alt: "Συμπαγές μπάνιο με λευκούς μαρμάρινους τοίχους και γυάλινη πόρτα ντους." },
] as const;
