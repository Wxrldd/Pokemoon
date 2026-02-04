const argon2 = require('argon2');
import { PrismaClient } from '@prisma/client';


export async function onSubscribe(data: { email: string; password: string }) {
  const prisma = new PrismaClient({
    datasourceUrl: process.env.DATABASE_URL,
  });
  console.log("SUBSCRIBE DATA", data);
  try {
    const hashedPassword = await argon2.hash(data.password);
    console.log("Hashed password", hashedPassword);
    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
      },
    });
    console.log("User created", user);
    return { success: true, user };
  } catch (error) {
    console.error("Error hashing password", error);
    return { success: false, error: "Error hashing password" };
  }
}