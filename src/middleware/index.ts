import { sequence } from "astro:middleware";
import { compression } from "./compression";
import { cache } from "./cache";
import { authMiddleware } from "./auth";

export const onRequest = sequence(authMiddleware, cache, compression);
