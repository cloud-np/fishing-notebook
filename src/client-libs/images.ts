import type { ImageMetadata } from "astro";

export interface LocalImage {
	imageMetadata: ImageMetadata;
	alt: string;
}
