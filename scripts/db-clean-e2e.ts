import { connect } from "./db";

/** Marker used by the end-to-end tests in the records they create. */
export const E2E_MARKER = "Prueba automática E2E";

async function main() {
  const client = await connect();
  try {
    await client.query("begin");
    const establishments = (await client.query<{ id: string }>("select id from establishments where name = $1", [E2E_MARKER])).rows.map((row) => row.id);
    if (establishments.length) {
      await client.query("delete from movements where lot_id in (select id from lots where establishment_id = any($1))", [establishments]);
      await client.query("delete from reservations where offer_id in (select o.id from offers o join lots l on l.id = o.lot_id where l.establishment_id = any($1))", [establishments]);
      await client.query("delete from offers where lot_id in (select id from lots where establishment_id = any($1))", [establishments]);
      await client.query("delete from lots where establishment_id = any($1)", [establishments]);
      await client.query("delete from users where establishment_id = any($1)", [establishments]);
      await client.query("delete from establishments where id = any($1)", [establishments]);
    }
    const messages = await client.query("delete from contact_messages where subject = $1", [E2E_MARKER]);
    await client.query("commit");
    console.log(`Limpieza E2E: ${establishments.length} establecimientos y ${messages.rowCount} mensajes de prueba eliminados.`);
  } catch (error) {
    await client.query("rollback");
    throw error;
  } finally {
    await client.end();
  }
}

main().catch((error) => { console.error(error); process.exit(1); });
