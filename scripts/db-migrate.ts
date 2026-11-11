import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { connect } from "./db";

const directory = path.join(process.cwd(), "supabase", "migrations");

async function main() {
  const client = await connect();
  try {
    await client.query("create table if not exists schema_migrations (name text primary key, applied_at timestamptz not null default now())");
    await client.query("alter table schema_migrations enable row level security");
    const applied = new Set((await client.query<{ name: string }>("select name from schema_migrations")).rows.map((row) => row.name));
    const files = (await readdir(directory)).filter((file) => file.endsWith(".sql")).sort();
    for (const file of files) {
      if (applied.has(file)) { console.log(`= ${file}`); continue; }
      const sql = await readFile(path.join(directory, file), "utf8");
      await client.query("begin");
      try {
        await client.query(sql);
        await client.query("insert into schema_migrations (name) values ($1)", [file]);
        await client.query("commit");
        console.log(`+ ${file}`);
      } catch (error) {
        await client.query("rollback");
        throw error;
      }
    }
  } finally {
    await client.end();
  }
}

main().catch((error) => { console.error(error); process.exit(1); });
