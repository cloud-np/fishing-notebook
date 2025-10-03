import be1 from "@assets/bedrooms/be1.webp";
import be2 from "@assets/bedrooms/be2.webp";
import be3 from "@assets/bedrooms/be3.webp";
import be4 from "@assets/bedrooms/be4.webp";
import be5 from "@assets/bedrooms/be5.webp";
import be6 from "@assets/bedrooms/be6.webp";
import type { LocalImage } from "@client-libs/images";

export const BEDROOMS_IMAGES: LocalImage[] = [
	{ imageMetadata: be1, alt: "Άνετη ανακαίνιση υπνοδωματίου με μοντέρνα έπιπλα και ζεστούς τόνους." },
	{ imageMetadata: be2, alt: "Μοντέρνος σχεδιασμός υπνοδωματίου με κομψό στυλ και λειτουργικό χώρο." },
	{ imageMetadata: be3, alt: "Κομψό υπνοδωμάτιο με σύγχρονο εξοπλισμό και ζεστή ατμόσφαιρα." },
	{ imageMetadata: be4, alt: "Πολυτελής ανακαίνιση υπνοδωματίου με προσεγμένες λεπτομέρειες." },
	{ imageMetadata: be5, alt: "Μινιμαλιστικό υπνοδωμάτιο με καθαρές γραμμές και φυσικό φωτισμό." },
	{ imageMetadata: be6, alt: "Σύγχρονο υπνοδωμάτιο με μοντέρνα έπιπλα." },
] as const;
