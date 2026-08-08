// Asigna un psicólogo de cabecera a los estudiantes que no lo tengan
// (migración 0021). Uso: npm run db:asignar:psicologos
//
// Reparte en round-robin entre los psicólogos activos, ordenados por nombre
// para que el reparto sea estable: correr el script dos veces da el mismo
// resultado. Solo toca las filas con `psicologo_id IS NULL`, así que nunca
// reasigna a un joven que ya tiene psicólogo — eso es una decisión del equipo,
// no de un script.
import { config } from "dotenv";
import pg from "pg";

config({ path: ".env.local" });

const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
await client.connect();

const { rows: psicologos } = await client.query(
  `SELECT u.id, u.nombre
     FROM usuario u JOIN rol r ON r.id = u.rol_id
    WHERE r.nombre = 'psicologo' AND u.activo = TRUE
    ORDER BY u.nombre`,
);

if (psicologos.length === 0) {
  console.error("! No hay psicólogos activos. Crea uno antes de asignar.");
  await client.end();
  process.exit(1);
}

const { rows: pendientes } = await client.query(
  `SELECT id, nombre FROM estudiante WHERE psicologo_id IS NULL ORDER BY nombre`,
);

if (pendientes.length === 0) {
  console.log("= Todos los estudiantes ya tienen psicólogo asignado.");
  await client.end();
  process.exit(0);
}

let asignados = 0;
for (const [i, estudiante] of pendientes.entries()) {
  const psicologo = psicologos[i % psicologos.length];
  await client.query(`UPDATE estudiante SET psicologo_id = $2 WHERE id = $1`, [
    estudiante.id,
    psicologo.id,
  ]);
  console.log(`+ ${estudiante.nombre} → ${psicologo.nombre}`);
  asignados++;
}

console.log(
  `Listo: ${asignados} estudiante(s) asignado(s) entre ${psicologos.length} psicólogo(s).`,
);
await client.end();
