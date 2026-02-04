import type { PageContextServer } from 'vike/types';
import { getCurrentUser } from '../server/auth';

export type Data = {
    user: { userId: number; email: string; pseudo: string } | null;
};

export async function data(pageContext: PageContextServer): Promise<Data> {
    // Get cookies from pageContext headers
    const headers = pageContext.headers || {};
    const cookieHeader = headers.cookie || headers.Cookie || '';

    // Create a Request-like object with the cookie header
    const request = new Request('http://localhost', {
        headers: {
            cookie: cookieHeader,
        },
    });

    const user = await getCurrentUser(request);
    return { user };
}
