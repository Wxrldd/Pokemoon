const argon2 = require('argon2');
import { prisma } from '../../server/db';
import { generateToken } from '../../server/jwt';
import { setAuthTokenCookie } from '../../server/auth-utils';

export async function onSubscribe(data: { email: string; password: string; pseudo: string }) {
  console.log("SUBSCRIBE DATA", data);
  try {
    const hashedPassword = await argon2.hash(data.password);
    console.log("Hashed password", hashedPassword);
    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        pseudo: data.pseudo,
      },
    });
    console.log("User created", user);

    // Generate JWT token
    const token = await generateToken(user.id, user.email, user.pseudo);
    console.log("Token generated", token);

    // Set httpOnly cookie
    setAuthTokenCookie(token);

    const { password: _, ...userWithoutPassword } = user;
    return { success: true, user: userWithoutPassword };
  } catch (error) {
    console.error("Error creating user", error);
    return { success: false, error: "Error creating user" };
  }
}