import { Pool } from "pg";

const globalDatabase = globalThis as typeof globalThis & {
  kiochanPool?: Pool;
};

export function getPool(): Pool {
  if (globalDatabase.kiochanPool) return globalDatabase.kiochanPool;

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL is required.");

  const pool = new Pool({
    connectionString,
    application_name: "kiochan-web",
    max: 5,
    connectionTimeoutMillis: 5_000,
    idleTimeoutMillis: 30_000,
    query_timeout: 5_000,
  });

  pool.on("error", () => {
    console.error("An idle PostgreSQL connection failed.");
  });

  globalDatabase.kiochanPool = pool;
  return pool;
}
