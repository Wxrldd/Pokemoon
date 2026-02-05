// Cookie utility for telefunc
// This allows telefunc functions to set cookies through a global store

export interface CookieOptions {
    httpOnly?: boolean;
    secure?: boolean;
    sameSite?: 'strict' | 'lax' | 'none';
    maxAge?: number;
    path?: string;
}

export class CookieStore {
    private cookies: Map<string, { value: string; options: CookieOptions }> = new Map();

    set(name: string, value: string, options: CookieOptions = {}): void {
        this.cookies.set(name, { value, options });
    }

    getCookies(): string[] {
        const cookieStrings: string[] = [];
        for (const [name, { value, options }] of this.cookies) {
            const parts: string[] = [`${name}=${value}`];

            if (options.httpOnly) parts.push('HttpOnly');
            if (options.secure) parts.push('Secure');
            if (options.sameSite) parts.push(`SameSite=${options.sameSite}`);
            if (options.maxAge !== undefined) parts.push(`Max-Age=${options.maxAge}`);
            if (options.path) parts.push(`Path=${options.path}`);
            else parts.push('Path=/');

            cookieStrings.push(parts.join('; '));
        }
        return cookieStrings;
    }

    clear(): void {
        this.cookies.clear();
    }
}

// Global store for request-scoped cookies
// Keyed by request URL to handle concurrent requests
const requestCookieStores = new Map<string, CookieStore>();

export function getCookieStoreForRequest(requestId: string): CookieStore {
    if (!requestCookieStores.has(requestId)) {
        requestCookieStores.set(requestId, new CookieStore());
    }
    return requestCookieStores.get(requestId)!;
}

export function getCookieStoreForRequestAndCleanup(requestId: string): CookieStore {
    const store = getCookieStoreForRequest(requestId);
    // Clean up after a delay to allow telefunc to complete
    setTimeout(() => {
        requestCookieStores.delete(requestId);
    }, 1000);
    return store;
}
