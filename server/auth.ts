import { verifyToken } from './jwt';

export async function getCurrentUser(request: Request): Promise<{ userId: number; email: string; } | null> {
    // Get cookie from request
    const cookieHeader = request.headers.get('cookie');
    if (!cookieHeader) {
        return null;
    }

    // Parse cookies
    const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
        const [name, value] = cookie.trim().split('=');
        acc[name] = value;
        return acc;
    }, {} as Record<string, string>);

    const token = cookies['auth-token'];
    if (!token) {
        return null;
    }

    // Verify token
    return await verifyToken(token);
}
