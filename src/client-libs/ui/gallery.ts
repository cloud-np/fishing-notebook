import type { ImageMetadata } from "astro";

export interface LoadedImage {
	src: ImageMetadata;
	alt: string;
}
