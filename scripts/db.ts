import { Client } from "pg";

/**
 * Direct Postgres connection for local scripts (migrations, seed, DB tests).
 * Uses the non-pooling URL so multi-statement migrations run in one session.
 */
export async function connect(): Promise<Client> {
  const raw = process.env.POSTGRES_URL_NON_POOLING ?? process.env.POSTGRES_URL;
  if (!raw) throw new Error("Falta POSTGRES_URL_NON_POOLING. Ejecuta `vercel env pull .env.local --yes`.");
  const url = new URL(raw);
  // node-pg treats sslmode=require as full verification, which fails on Supabase's chain; we pass TLS options explicitly instead.
  url.searchParams.delete("sslmode");
  url.searchParams.delete("supa");
  const client = new Client({ connectionString: url.toString(), ssl: { rejectUnauthorized: false } });
  await client.connect();
  return client;
}
