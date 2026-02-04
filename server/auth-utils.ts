import type { CookieStore } from './cookies';

/**
 * Sets the authentication token in an httpOnly cookie
 * @param token - The JWT token to set
 */
export function setAuthTokenCookie(token: string): void {
    const cookieStore = (globalThis as any).__telefuncCookieStore as CookieStore | undefined;
    if (cookieStore) {
        cookieStore.set('auth-token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7, // 7 days in seconds
            path: '/',
        });
    }
}
