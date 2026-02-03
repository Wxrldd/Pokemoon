const argon2 = require('argon2');
// import { PrismaClient } from '@prisma/client';

export async function onSubscribe(data: { email: string; password: string }) {
  console.log("Côté backend", data);
  //   try {
  //     const hashedPassword = await argon2.hash(data.password);
  //     const user = await prisma.user.create({
  //       data: {
  //         email: data.email,
  //         password: hashedPassword,
  //       },
  //     });
  //     return { success: true, user };
  //   } catch (error) {
  //     console.error("Error hashing password", error);
  //     return { success: false, error: "Error hashing password" };
  // }
} 