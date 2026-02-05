import { SignJWT, jwtVerify } from 'jose';

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

const JWT_EXPIRATION = '1d';

export async function generateToken(userId: number, email: string, pseudo: string): Promise<string> {
    const token = await new SignJWT({ userId, email, pseudo })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime(JWT_EXPIRATION)
        .sign(SECRET);

    return token;
}

export async function verifyToken(token: string): Promise<{ userId: number; email: string; pseudo: string } | null> {
    try {
        const { payload } = await jwtVerify(token, SECRET);
        return {
            userId: payload.userId as number,
            email: payload.email as string,
            pseudo: payload.pseudo as string,
        };
    } catch (error) {
        return null;
    }
}
