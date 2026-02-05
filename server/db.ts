import { PrismaClient } from '@prisma/client';

// Create a singleton Prisma client instance
// This prevents creating multiple instances in development
const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
};

export const prisma =
    globalForPrisma.prisma ??
    new PrismaClient({} as any);
