import { connect } from "./db";

/** Marker used by the end-to-end tests in the form submissions they create. */
export const E2E_MARKER = "Prueba automática E2E";

async function main() {
  const client = await connect();
  try {
    const applications = await client.query("delete from business_applications where business_name = $1", [E2E_MARKER]);
    const messages = await client.query("delete from contact_messages where subject = $1", [E2E_MARKER]);
    console.log(`Limpieza E2E: ${applications.rowCount} solicitudes y ${messages.rowCount} mensajes de prueba eliminados.`);
  } finally {
    await client.end();
  }
}

main().catch((error) => { console.error(error); process.exit(1); });
