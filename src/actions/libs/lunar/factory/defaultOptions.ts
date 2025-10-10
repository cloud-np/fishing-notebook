import { Hemisphere } from "../lunar.const";
import type { MoonOptions } from "../Moon";

/** Default moon options factory */
export const defaultOptions: Partial<MoonOptions> = {
	hemisphere: Hemisphere.NORTHERN,
};
