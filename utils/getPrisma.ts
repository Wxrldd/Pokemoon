import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "@/generated/prisma/client";

export function getPrisma() {
  const adapter = new PrismaBetterSqlite3({
    url: process.env.DATABASE_URL
  })
  return new PrismaClient({ adapter });
}