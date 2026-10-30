import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./generated/prisma/client.ts";

const globalDatabase = globalThis as typeof globalThis & {
  kiochanPrisma?: PrismaClient;
};

export function getDatabase(): PrismaClient {
  if (globalDatabase.kiochanPrisma) return globalDatabase.kiochanPrisma;

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL is required.");

  const adapter = new PrismaPg(
    {
      connectionString,
      application_name: "kiochan-web",
      max: 5,
      connectionTimeoutMillis: 5_000,
      idleTimeoutMillis: 30_000,
      query_timeout: 5_000,
    },
    {
      onPoolError: () => console.error("An idle PostgreSQL connection failed."),
    },
  );
  const client = new PrismaClient({ adapter, log: [] });
  globalDatabase.kiochanPrisma = client;
  return client;
}
