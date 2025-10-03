export type BrowserType =
    "Firefox"
    | "Chrome"
    | "Safari"
    | "Opera"
    | "Edge"
    | "Internet Eplorer"
    | "Unknown Browser";

export type CookieType =
	"consent"
	| "analytics-consent";

export type CookieValue = 'accepted' | 'rejected';

export function getUserBroswerName(): BrowserType | undefined {
    if (typeof window === undefined) {
        return undefined;
    }
    const userAgent = window.navigator.userAgent;
    if (userAgent.indexOf("Firefox") !== -1) {
        return "Firefox";
    } else if (userAgent.indexOf("Chrome") !== -1) {
        return "Chrome";
    } else if (userAgent.indexOf("Safari") !== -1) {
        return "Safari";
    } else if (userAgent.indexOf("Opera") !== -1 || userAgent.indexOf("OPR") !== -1) {
        return "Opera";
    } else if (userAgent.indexOf("Edge") !== -1) {
        return "Edge";
    } else if (userAgent.indexOf("MSIE") !== -1 || userAgent.indexOf("Trident") !== -1) {
        return "Internet Eplorer";
    } else {
        return "Unknown Browser";
    }
}

export function setCookie(name: string, value: string, days: number = 7, path: string = "/"): void {
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=${path}; SameSite=Lax`;
}

export function getCookie(name: string): string | null {
    return document.cookie.split("; ").reduce((r, v) => {
        const parts = v.split("=");
        return parts[0] === name ? decodeURIComponent(parts[1]) : r;
    }, '');
}

export function deleteCookie(name: string, path: string = "/"): void {
    setCookie(name, "", -1, path);
}

// Ideally should be moved to global.d.ts but
// this I prefer this since its closer to the usage.
declare global {
    interface Window {
        gtag: (...args: any[]) => void;
        dataLayer: Record<string, any>[];
    }
}

export function enableGa() {
    if (typeof window.gtag !== "undefined") {
        window.gtag('consent', 'update', {
            'analytics_storage': 'granted'
        });
    }
}

export function disableGa() {
    if (typeof window.gtag !== "undefined") {
        window.gtag('consent', 'default', {
            'ad_storage': 'denied',           // Controls ad-related cookies
            'ad_user_data': 'denied',         // Controls user data for ads
            'ad_personalization': 'denied',   // Controls ad personalization
            'analytics_storage': 'denied'     // Controls ALL GA cookies (_ga, _gid, etc.)
        });
    }
}

export function deleteAllCookiesExceptConsent() {
    const consentCookies = ['cookie-consent', 'analytics-cookies'];

    document.cookie.split(';').forEach(cookie => {
        const eqPos = cookie.indexOf('=');
        const name = cookie.substring(0, eqPos > -1 ? eqPos : cookie.length).trim();
        // Skip our consent cookies
        if (!consentCookies.includes(name)) {
            const expireString = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`;
            // Delete from current domain
            document.cookie = expireString;
            // Try deleting from parent domains
            document.cookie = `${expireString}; domain=${window.location.hostname}`;
            // Try root domain
            const parts = window.location.hostname.split('.');
            if (parts.length > 2) {
                const rootDomain = `.${parts.slice(-2).join('.')}`;
                document.cookie = `${expireString}; domain=${rootDomain}`;
            }
        }
    });
}
