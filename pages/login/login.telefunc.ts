import argon2 from "argon2";
import { getPrisma } from "../../utils/getPrisma";
import { generateToken } from "../../server/jwt";
import { setAuthTokenCookie } from "../../server/auth-utils";
import { loginServerSchema } from "../../validation/auth.schema";
import { AUTH_ERROR_MESSAGES } from "../../utils/errorMessages";
import { ZodError } from "zod";

export async function onLogin(data: { email: string; password: string }) {
    try {
        const validatedData = loginServerSchema.parse(data);

        const prisma = getPrisma();

        const user = await prisma.user.findFirst({
            where: {
                email: validatedData.email,
            },
        });

        if (!user) {
            return {
                success: false,
                error: AUTH_ERROR_MESSAGES.general.invalidCredentials,
            };
        }

        const isPasswordValid = await argon2.verify(user.password, validatedData.password);

        if (!isPasswordValid) {
            return {
                success: false,
                error: AUTH_ERROR_MESSAGES.general.invalidCredentials,
            };
        }

        const token = await generateToken(user.id, user.email);

        setAuthTokenCookie(token);

        const { password: _, ...userWithoutPassword } = user;

        console.log("User logged in successfully:", userWithoutPassword);

        return {
            success: true,
            user: {
                id: userWithoutPassword.id,
                email: userWithoutPassword.email,
            },
        };
    } catch (error) {
        if (error instanceof ZodError) {
            const firstError = error.issues[0];
            return {
                success: false,
                error: firstError?.message || AUTH_ERROR_MESSAGES.general.serverError,
            };
        }

        console.error("Error during login:", error);

        return {
            success: false,
            error: AUTH_ERROR_MESSAGES.general.serverError,
        };
    }
}