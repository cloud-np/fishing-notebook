import { sequence } from "astro:middleware";
import { compression } from "./compression";
import { cache } from "./cache";

export const onRequest = sequence(cache, compression);
