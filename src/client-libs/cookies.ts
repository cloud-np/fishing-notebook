export type CookieCategoryType = 'Necessary' | 'Functional' | 'Analytics' | 'Performance' | 'Advertisement' | 'Uncategorized';
export type TimeUnit =
    | `${number} year${'' | 's'}`
    | `${number} month${'' | 's'}`
    | `${number} day${'' | 's'}`
    | `${number} hour${'' | 's'}`
    | "session"
    | "never";
export type CookieDuration = TimeUnit | `${TimeUnit} ${TimeUnit}` | `${TimeUnit} ${TimeUnit} ${TimeUnit}`;
export interface Cookie {
    name: string,
    duration: CookieDuration; // TODO: Someday we will map them automatically for now keep it simple
    description: string;
}
export interface CookieCategory {
    type: CookieCategoryType;
    description: string;
    cookies: Cookie[];
    isActive: boolean;
}
