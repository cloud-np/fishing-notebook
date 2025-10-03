import { ui, defaultLang, languages } from "./ui";
import type { CookieCategory } from "../clients-libs/cookies";

export function getLangFromUrl(url: URL) {
	const [, lang] = url.pathname.split("/");
	if (lang in languages) return lang as keyof typeof languages;
	return defaultLang;
}

type DeepKeys<T> = T extends object
	? {
			[K in keyof T]: K extends string
				? T[K] extends Record<string, any>
					? T[K] extends { el: string; en: string }
						?
								| K
								| (T[K] extends { el: string; en: string } & Record<string, any>
										? {
												[SubK in Exclude<keyof T[K], "el" | "en">]: SubK extends string
													? T[K][SubK] extends Record<string, any>
														? `${K}.${SubK}` | `${K}.${SubK}.${DeepKeys<T[K][SubK]>}`
														: `${K}.${SubK}`
													: never;
											}[Exclude<keyof T[K], "el" | "en">]
										: never)
						: `${K}.${DeepKeys<T[K]>}`
					: K
				: never;
		}[keyof T]
	: never;

type TranslationKey = DeepKeys<typeof ui>;

export function useTranslations(lang: keyof typeof languages) {
	return function t(key: TranslationKey) {
		const keys = key.split(".");
		let current: any = ui;

		for (const k of keys) {
			current = current[k];
			if (!current) {
				console.warn(`Translation key "${key}" not found`);
				return key;
			}
		}

		return current[lang] || current[defaultLang] || key;
	};
}

export function getTranslatedCookieCategories(
	lang: keyof typeof languages
): (CookieCategory & { displayName: string })[] {
	const t = useTranslations(lang);

	return [
		{
			type: "Necessary",
			displayName: t("cookie.necessary"),
			description: t("cookie.necessary.desc"),
			isActive: true,
			cookies: Object.keys(ui.cookie.necessary.cookies).map(key => ({
				name: key,
				duration: t(`cookie.necessary.cookies.${key}.duration` as TranslationKey),
				description: t(`cookie.necessary.cookies.${key}` as TranslationKey),
			})),
		},
		{
			type: "Analytics",
			displayName: t("cookie.analytics"),
			description: t("cookie.analytics.desc"),
			isActive: false,
			cookies: Object.keys(ui.cookie.analytics.cookies).map(key => ({
				name: key,
				duration: t(`cookie.analytics.cookies.${key}.duration` as TranslationKey),
				description: t(`cookie.analytics.cookies.${key}` as TranslationKey),
			})),
		},
	];
}
