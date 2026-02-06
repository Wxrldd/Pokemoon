const argon2 = require('argon2');
import { getPrisma } from '../../utils/getPrisma';
import { generateToken } from '../../server/jwt';
import { setAuthTokenCookie } from '../../server/auth-utils';

export async function onSubscribe(data: { email: string; password: string; pseudo: string }) {
  console.log("SUBSCRIBE DATA", data);
  try {
    const prisma = getPrisma();

    const existingUser = await prisma.user.findFirst({
      where: {
        email: data.email,
      },
    });

    if (existingUser) {
      return { success: false, error: "User already exists!" };
    }

    const hashedPassword = await argon2.hash(data.password);

    const newUser = await prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        pseudo: data.pseudo,
      },
    });

    const token = await generateToken(newUser.id, newUser.email, newUser.pseudo);

    setAuthTokenCookie(token);

    const { password: _, ...userWithoutPassword } = newUser;
    console.log("User created successfully", userWithoutPassword);

    return { success: true, user: userWithoutPassword };
  } catch (error) {
    console.error("Error during subscription", error);
    return { success: false, error: "Error during subscription" };
  }
}