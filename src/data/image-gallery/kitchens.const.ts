import k1 from "@assets/kitchens/k1.webp";
import k2 from "@assets/kitchens/k2.webp";
import k3 from "@assets/kitchens/k3.webp";
import k4 from "@assets/kitchens/k4.webp";
import type { LocalImage } from "@client-libs/images";

export const KITCHENS_IMAGES: LocalImage[] = [
	{ imageMetadata: k1, alt: "Σύγχρονη ανακαίνιση κουζίνας με μεγάλους πάγκους και μοντέρνα ντουλάπια." },
	{ imageMetadata: k2, alt: "Μοντέρνος σχεδιασμός κουζίνας με νησίδα και υψηλής ποιότητας υλικά." },
	{ imageMetadata: k3, alt: "Έργο αναβάθμισης κουζίνας με κομψό φωτισμό και πλήρες λειτουργικό χώρο." },
	{ imageMetadata: k4, alt: "Έργο εσωτερικής διακόσμησης κουζίνας με σύγχρονα στοιχεία και ζεστή ατμόσφαιρα." },
] as const;
