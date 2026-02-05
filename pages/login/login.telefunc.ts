const argon2 = require('argon2');
import { prisma } from '../../server/db';
import { generateToken } from '../../server/jwt';
import { setAuthTokenCookie } from '../../server/auth-utils';

export async function onLogin(data: { email: string; password: string; }) {
    console.log("LOGIN DATA", data);
    try {
        // Find user by email
        const user = await prisma.user.findFirst({
            where: {
                email: data.email,
            },
        });

        if (!user) {
            return { success: false, error: "No user found !" };
        }

        // Verify password
        const isValidPassword = await argon2.verify(user.password, data.password); // hash auto
        console.log("User password hash", user.password);
        console.log("Password to verify", data.password);
        console.log("Is valid password", isValidPassword);
        if (!isValidPassword) {
            return { success: false, error: "Invalid password !" };
        }

        // Generate JWT token
        const token = await generateToken(user.id, user.email, user.pseudo);

        // Set httpOnly cookie
        setAuthTokenCookie(token);

        // Return user data (without password)
        const { password: _, ...userWithoutPassword } = user;
        console.log("User logged in successfully", userWithoutPassword);

        return { success: true, user: userWithoutPassword };
    } catch (error) {
        console.error("Error during login", error);
        return { success: false, error: "Error during login" };
    }
}
